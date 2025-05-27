from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pickle
import os
from pathlib import Path

app = Flask(__name__)
CORS(app)

# Load pre-trained models and data
embeddings = pickle.load(open('embeddings.pkl', 'rb'))
filenames = pickle.load(open('filenames.pkl', 'rb'))

# Configure image paths
DATASET_PATH = Path(__file__).parent.parent / 'datasets' / 'fashion-dataset' / 'images'

@app.route('/images/<image_id>')
def serve_image(image_id):
    try:
        image_path = DATASET_PATH / f"{image_id}"
        return send_file(image_path, mimetype='image/jpeg')
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    try:
        data = request.json
        product_id = data.get('productId')
        
        # TODO: Implement recommendation logic using embeddings
        # For now, return sample recommendations
        return jsonify({
            'success': True,
            'recommendations': filenames[:5]  # Return first 5 images as recommendations
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'images_path': str(DATASET_PATH),
        'images_available': len(filenames)
    })

if __name__ == '__main__':
    # Verify dataset path exists
    if not DATASET_PATH.exists():
        print(f"Warning: Dataset path not found: {DATASET_PATH}")
    else:
        print(f"Dataset path found: {DATASET_PATH}")
        print(f"Total images available: {len(filenames)}")
    
    # Start the server
    app.run(debug=True, port=5000)