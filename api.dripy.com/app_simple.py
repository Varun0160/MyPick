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

app = Flask(__name__)
CORS(app)

print("Loading model and embeddings...")

# Load the pre-trained model
model = ResNet50(weights='imagenet', include_top=False)

# Load the embeddings and filenames
with open('embeddings.pkl', 'rb') as f:
    embeddings = pickle.load(f)

with open('filenames.pkl', 'rb') as f:
    filenames = pickle.load(f)

# Initialize nearest neighbors
neighbors = NearestNeighbors(n_neighbors=6, algorithm='brute', metric='euclidean')
neighbors.fit(embeddings)

print("Model and embeddings loaded successfully")

def extract_features(img_path, model):
    try:
        img = image.load_img(img_path, target_size=(224, 224))
        img_array = image.img_to_array(img)
        expanded_img_array = np.expand_dims(img_array, axis=0)
        preprocessed_img = preprocess_input(expanded_img_array)
        result = model.predict(preprocessed_img).flatten()
        normalized_result = result/norm(result)
        return normalized_result
    except Exception as e:
        print(f"Error extracting features: {str(e)}")
        return None

def download_image(url, save_path):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response, open(save_path, 'wb') as out_file:
            out_file.write(response.read())
        return True
    except Exception as e:
        print(f"Error downloading image: {str(e)}")
        return False

@app.route('/')
def home():
    return jsonify({"status": "ok"})

@app.route('/api/image-search')
def image_search():
    try:
        url = request.args.get('url')
        if not url:
            return jsonify({'success': False, 'error': 'No URL provided'}), 400

        print(f"Processing URL: {url}")
        temp_path = os.path.join("uploads", f"search_{hash(url)}.jpg")
        
        # Ensure uploads directory exists
        os.makedirs("uploads", exist_ok=True)
        
        if not download_image(url, temp_path):
            return jsonify({'success': False, 'error': 'Failed to download image'}), 400
            
        features = extract_features(temp_path, model)
        if features is None:
            return jsonify({'success': False, 'error': 'Failed to process image'}), 400
            
        distances, indices = neighbors.kneighbors([features])
        similar_images = []
        
        for i in indices[0]:
            img_id = str(filenames[i].split('/')[-1].split('.')[0])
            similar_images.append(int(img_id))
        
        try:
            os.remove(temp_path)
        except:
            pass
            
        return jsonify({
            'success': True,
            'result': similar_images
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    print("Starting Flask server...")
    app.run(host='127.0.0.1', port=5000)
