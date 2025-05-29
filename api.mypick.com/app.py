from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import numpy as np
import os
import urllib.request
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from sklearn.neighbors import NearestNeighbors
from numpy.linalg import norm
import pickle
import logging
import hashlib
from pathlib import Path
import time
from functools import lru_cache

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
app.config['DEBUG'] = True

# Configure dataset paths - try multiple possible locations
DATASET_PATHS = [
    os.path.join(os.path.dirname(os.path.dirname(__file__)), 'datasets', 'fashion-dataset', 'images'),    os.path.join(os.path.dirname(os.path.dirname(__file__)), 'www.mypick.com', 'api.mypick.com', 'images'),
    os.path.join(os.path.dirname(os.path.dirname(__file__)), 'www.mypick.com', 'public', 'images'),
    os.path.join(os.path.dirname(__file__), 'uploads')
]

# Set to store valid image IDs
VALID_IMAGE_IDS = set()

# Ensure all image directories exist and populate VALID_IMAGE_IDS
for path in DATASET_PATHS:
    os.makedirs(path, exist_ok=True)
    if os.path.exists(path):
        for file in os.listdir(path):
            if file.endswith(('.jpg', '.jpeg', '.png')):
                VALID_IMAGE_IDS.add(os.path.splitext(file)[0])

# Global variables to store loaded models and data
model = None
neighbors = None
embeddings = None
filenames = None

@app.route('/api/health')
def health_check():
    """Health check endpoint that also verifies model and data availability"""
    global model, neighbors, embeddings, filenames
    status = {
        'status': 'healthy' if all([model, neighbors, embeddings, filenames]) else 'error',
        'model_loaded': model is not None,
        'neighbors_loaded': neighbors is not None,
        'embeddings_loaded': embeddings is not None,
        'filenames_loaded': filenames is not None,
        'uploads_dir': os.path.exists('uploads')
    }
    return jsonify(status)

@app.before_first_request
def load_model():
    """Load all required models and data before first request"""
    global model, neighbors, embeddings, filenames
    
    try:
        logger.info("Loading ResNet50 model...")
        model = ResNet50(weights='imagenet', include_top=False)
        
        logger.info("Loading embeddings and filenames...")
        if not os.path.exists('embeddings.pkl') or not os.path.exists('filenames.pkl'):
            raise FileNotFoundError("Required model files (embeddings.pkl or filenames.pkl) not found!")
            
        embeddings = pickle.load(open('embeddings.pkl', 'rb'))
        filenames = pickle.load(open('filenames.pkl', 'rb'))
        
        if len(embeddings) == 0 or len(filenames) == 0:
            raise ValueError("Embeddings or filenames data is empty!")
            
        # Validate filenames exist
        missing_files = []
        for fname in filenames[:10]:  # Check first 10 files as a sample
            exists = False
            for base_path in DATASET_PATHS:
                if os.path.exists(os.path.join(base_path, os.path.basename(fname))):
                    exists = True
                    break
            if not exists:
                missing_files.append(fname)
                
        if missing_files:
            logger.warning(f"Some image files are missing: {missing_files}")
            
        logger.info("Initializing NearestNeighbors...")
        neighbors = NearestNeighbors(n_neighbors=6, algorithm='brute', metric='euclidean')
        neighbors.fit(embeddings)
        
        logger.info(f"All models and data loaded successfully. Found {len(filenames)} images in dataset.")
    except Exception as e:
        logger.error(f"Error loading models and data: {str(e)}")
        raise

def extract_features(img_path, model):
    """Extract features from an image using the ResNet50 model"""
    try:
        if not os.path.exists(img_path):
            raise FileNotFoundError(f"Image file not found: {img_path}")
            
        logger.debug(f"Loading image from {img_path}")
        img = image.load_img(img_path, target_size=(224, 224))
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)
        
        logger.debug("Extracting features using ResNet50")
        features = model.predict(x)
        features_normalized = features.flatten() / norm(features.flatten())
        return features_normalized
    except Exception as e:
        logger.error(f"Error extracting features from {img_path}: {str(e)}")
        return None

def download_image(url, save_path):
    """Download an image from a URL with proper error handling"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'image/jpeg,image/png,image/*;q=0.8',
            'Referer': 'http://localhost:3000'
        }
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response, open(save_path, 'wb') as out_file:
            out_file.write(response.read())
        return True
    except Exception as e:
        logger.error(f"Error downloading image: {str(e)}")
        return False

@app.route('/api/image-search')
def image_search():
    """Handle image search requests"""
    logger.info("Received image search request")
    try:
        # Check if models are loaded
        if not all([model, neighbors, embeddings, filenames]):
            raise RuntimeError("Models and data not fully loaded. Please wait and try again.")
            
        # Validate input
        url = request.args.get('url')
        if not url:
            return jsonify({'success': False, 'error': 'No URL provided'}), 400
            
        logger.info(f"Processing URL: {url}")
        
        # Create a unique filename for this request
        url_hash = hashlib.md5(url.encode()).hexdigest()
        temp_path = os.path.join("uploads", f"search_{url_hash}.jpg")
        
        # Ensure uploads directory exists
        os.makedirs("uploads", exist_ok=True)
        
        # Download the image
        logger.info(f"Downloading image to {temp_path}")
        if not download_image(url, temp_path):
            return jsonify({'success': False, 'error': 'Failed to download image. Please check the URL and try again.'}), 400
        
        # Extract features
        logger.info("Extracting image features")
        features = extract_features(temp_path, model)
        if features is None:
            return jsonify({'success': False, 'error': 'Failed to process image. Please try a different image.'}), 400
            
        # Find similar images
        logger.info("Finding similar images")
        distances, indices = neighbors.kneighbors([features])
        similar_images = []
        
        for i in indices[0]:
            if i < len(filenames):
                img_id = str(filenames[i].split('/')[-1].split('.')[0])
                try:
                    similar_images.append(int(img_id))
                except ValueError:
                    logger.warning(f"Invalid image ID format: {img_id}")
                    continue
        
        if not similar_images:
            return jsonify({'success': False, 'error': 'No similar images found'}), 404
            
        # Clean up
        try:
            os.remove(temp_path)
        except Exception as e:
            logger.warning(f"Failed to remove temporary file {temp_path}: {str(e)}")
            
        logger.info(f"Successfully found {len(similar_images)} similar images")
        return jsonify({
            'success': True,
            'result': similar_images
        })
        
    except Exception as e:
        logger.error(f"Error in image search: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@lru_cache(maxsize=1000)
def find_image_path(image_id):
    """Find the path to an image file with caching"""
    if not image_id:
        return None
        
    # Check each possible path
    for base_path in DATASET_PATHS:
        for ext in ['.jpg', '.jpeg', '.png']:
            path = os.path.join(base_path, f"{image_id}{ext}")
            if os.path.exists(path):
                try:
                    # Verify file is readable
                    with open(path, 'rb') as f:
                        f.read(1)
                    return path, ext[1:]  # Return both path and extension type
                except Exception:
                    continue
    return None

@app.route('/images/<path:image_id>')
def serve_image(image_id):
    """Serve images with efficient caching and error handling"""
    try:
        if not image_id:
            return jsonify({'error': 'No image ID provided'}), 400
            
        # Clean the image ID
        image_id = os.path.splitext(image_id)[0]
        image_id = os.path.basename(image_id)
        
        if image_id.startswith('content/images/images/'):
            image_id = image_id.replace('content/images/images/', '')
        
        # Quick check if image ID is valid
        if image_id not in VALID_IMAGE_IDS:
            logger.warning(f"Image ID {image_id} not in valid IDs list")
            return jsonify({
                'error': 'Image not found',
                'details': f'Image {image_id} does not exist in the dataset'
            }), 404
        
        # Find the image path (cached)
        result = find_image_path(image_id)
        
        if result:
            path, ext = result
            return send_file(path, mimetype=f'image/{ext}')
        
        logger.warning(f"Image {image_id} not found in any configured location")
        return jsonify({
            'error': 'Image not found',
            'details': f'Image {image_id} exists in dataset but file is missing'
        }), 404
        
    except Exception as e:
        logger.error(f"Error serving image {image_id}: {str(e)}")
        return jsonify({
            'error': 'Server error',
            'details': str(e)
        }), 500

@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    """Handle image uploads and save to appropriate directories"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
            
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        if file:
            # Generate a unique filename
            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in ['.jpg', '.jpeg', '.png']:
                return jsonify({'error': 'Invalid file type'}), 400
                
            filename = f"{hashlib.md5(str(time.time()).encode()).hexdigest()}{ext}"
            
            # Save to all relevant directories
            saved_paths = []
            for base_path in DATASET_PATHS:
                try:
                    save_path = os.path.join(base_path, filename)
                    file.save(save_path)
                    saved_paths.append(save_path)
                except Exception as e:
                    logger.warning(f"Failed to save to {base_path}: {str(e)}")
                    
            if not saved_paths:
                return jsonify({'error': 'Failed to save image'}), 500
                
            return jsonify({
                'success': True,
                'filename': filename,
                'paths': saved_paths
            })
            
    except Exception as e:
        logger.error(f"Error uploading image: {str(e)}")
        return jsonify({'error': str(e)}), 500

def verify_directory_permissions():
    """Verify that all image directories exist and are accessible"""
    for path in DATASET_PATHS:
        try:
            # Create directory if it doesn't exist
            os.makedirs(path, exist_ok=True)
            
            # Try to create a test file to verify write permissions
            test_file = os.path.join(path, '.permissions_test')
            try:
                with open(test_file, 'w') as f:
                    f.write('test')
                os.remove(test_file)
                logger.info(f"Directory {path} exists and is writable")
            except Exception as e:
                logger.error(f"Directory {path} is not writable: {str(e)}")
                
            # List directory contents to verify read permissions
            files = os.listdir(path)
            logger.info(f"Directory {path} contains {len(files)} files")
            
        except Exception as e:
            logger.error(f"Error checking directory {path}: {str(e)}")

if __name__ == '__main__':
    # Verify directory permissions before starting
    verify_directory_permissions()
    
    # Ensure uploads directory exists
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    logger.info("Starting Flask server...")
    app.run(host='127.0.0.1', port=5000, debug=True)
