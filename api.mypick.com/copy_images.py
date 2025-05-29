import os
import csv
import requests
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure paths
DATASET_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'datasets', 'fashion-dataset')
IMAGES_CSV = os.path.join(DATASET_PATH, 'images.csv')
IMAGES_DIR = os.path.join(DATASET_PATH, 'images')

def download_image(row):
    filename, url = row
    save_path = os.path.join(IMAGES_DIR, filename)
    
    if os.path.exists(save_path):
        logger.debug(f"Skipping {filename} - already exists")
        return
        
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            logger.info(f"Downloaded {filename}")
        else:
            logger.warning(f"Failed to download {filename}: Status {response.status_code}")
    except Exception as e:
        logger.error(f"Error downloading {filename}: {str(e)}")

def main():
    # Create images directory if it doesn't exist
    os.makedirs(IMAGES_DIR, exist_ok=True)
    
    # Read the CSV file
    with open(IMAGES_CSV, 'r') as f:
        reader = csv.reader(f)
        next(reader)  # Skip header
        rows = list(reader)
        
    logger.info(f"Found {len(rows)} images to download")
    
    # Download images in parallel
    with ThreadPoolExecutor(max_workers=10) as executor:
        executor.map(download_image, rows)
        
if __name__ == "__main__":
    main()