import os
import requests
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

IMAGE_ID = "11153"
DATASET_PATHS = [
    os.path.join(os.path.dirname(os.path.dirname(__file__)), 'datasets', 'fashion-dataset', 'images'),    os.path.join(os.path.dirname(os.path.dirname(__file__)), 'www.mypick.com', 'api.mypick.com', 'images'),
    os.path.join(os.path.dirname(os.path.dirname(__file__)), 'www.mypick.com', 'public', 'images')
]

def get_image_url():
    """Get original image URL from images.csv"""
    csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'datasets', 'fashion-dataset', 'images.csv')
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.startswith(f"{IMAGE_ID}.jpg,"):
                    return line.split(',')[1].strip()
    except Exception as e:
        logger.error(f"Error reading CSV: {str(e)}")
    return None

def download_image():
    """Download and save the image"""
    url = get_image_url()
    if not url:
        logger.error(f"No URL found for image {IMAGE_ID}.jpg")
        return False
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.myntra.com/'
        }
        logger.info(f"Downloading {IMAGE_ID}.jpg from {url}")
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            for base_path in DATASET_PATHS:
                try:
                    os.makedirs(base_path, exist_ok=True)
                    image_path = os.path.join(base_path, f"{IMAGE_ID}.jpg")
                    with open(image_path, 'wb') as f:
                        f.write(response.content)
                    logger.info(f"Successfully saved {IMAGE_ID}.jpg to {base_path}")
                except Exception as e:
                    logger.error(f"Failed to save {IMAGE_ID}.jpg to {base_path}: {str(e)}")
            return True
        else:
            logger.error(f"Failed to download {IMAGE_ID}.jpg: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        logger.error(f"Error downloading {IMAGE_ID}.jpg: {str(e)}")
        return False

if __name__ == "__main__":
    download_image()
