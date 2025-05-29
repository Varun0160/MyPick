import os
import csv
import requests
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Missing image IDs
MISSING_IMAGES = ['11759', '11766', '11553', '10647']

# Dataset paths
DATASET_PATHS = [
    os.path.join(os.path.dirname(os.path.dirname(__file__)), 'datasets', 'fashion-dataset', 'images'),    os.path.join(os.path.dirname(os.path.dirname(__file__)), 'www.mypick.com', 'api.mypick.com', 'images'),
    os.path.join(os.path.dirname(os.path.dirname(__file__)), 'www.mypick.com', 'public', 'images')
]

def get_image_url(image_id):
    """Get original image URL from CSV files"""
    # Try grandfinaleX.csv first
    csv_path = os.path.join(os.path.dirname(__file__), 'grandfinaleX.csv')
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['id'] == image_id:
                    return row['link']
    except Exception as e:
        logger.warning(f"Error reading grandfinaleX.csv: {str(e)}")
    
    # Try images.csv next
    csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'datasets', 'fashion-dataset', 'images.csv')
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['filename'] == f"{image_id}.jpg":
                    return row['link']
    except Exception as e:
        logger.warning(f"Error reading images.csv: {str(e)}")
    
    return None

def download_image(image_id):
    """Download image from Myntra CDN"""
    url = get_image_url(image_id)
    if not url:
        logger.error(f"No URL found for image {image_id}.jpg")
        return False
    
    try:
        headers = {            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.myntra.com/'
        }
        logger.info(f"Downloading {image_id}.jpg from {url}")
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            # Save to all dataset paths
            for base_path in DATASET_PATHS:
                try:
                    os.makedirs(base_path, exist_ok=True)
                    image_path = os.path.join(base_path, f"{image_id}.jpg")
                    with open(image_path, 'wb') as f:
                        f.write(response.content)
                    logger.info(f"Successfully saved {image_id}.jpg to {base_path}")
                except Exception as e:
                    logger.error(f"Failed to save {image_id}.jpg to {base_path}: {str(e)}")
            return True
        else:
            logger.error(f"Failed to download {image_id}.jpg: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        logger.error(f"Error downloading {image_id}.jpg: {str(e)}")
        return False

def main():
    """Main function to restore missing images"""
    success_count = 0
    for image_id in MISSING_IMAGES:
        logger.info(f"Processing {image_id}.jpg...")
        if download_image(image_id):
            success_count += 1
        
    logger.info(f"Restored {success_count} out of {len(MISSING_IMAGES)} missing images")

if __name__ == "__main__":
    main()
