import os
import requests
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# List of missing image IDs
MISSING_IMAGES = ['11759', '11766', '11553', '10647']

# Dataset paths
DATASET_PATHS = [
    os.path.join(os.path.dirname(os.path.dirname(__file__)), 'datasets', 'fashion-dataset', 'images'),    os.path.join(os.path.dirname(os.path.dirname(__file__)), 'www.mypick.com', 'api.mypick.com', 'images'),
    os.path.join(os.path.dirname(os.path.dirname(__file__)), 'www.mypick.com', 'public', 'images'),
    os.path.join(os.path.dirname(__file__), 'uploads')
]

def verify_image_exists(image_id):
    """Check if image exists in any of the dataset paths"""
    for path in DATASET_PATHS:
        if os.path.exists(os.path.join(path, f"{image_id}.jpg")):
            return True
    return False

def download_image(image_id):
    """Download image from backup source"""
    # URLs to try for downloading images (add your backup image sources here)
    urls = [
        f"https://fashion-dataset.s3.amazonaws.com/images/{image_id}.jpg",
        f"https://fashion-dataset-backup.s3.amazonaws.com/images/{image_id}.jpg"
    ]
    
    for url in urls:
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                # Save to all dataset paths
                for path in DATASET_PATHS:
                    try:
                        if not os.path.exists(path):
                            os.makedirs(path, exist_ok=True)
                        
                        image_path = os.path.join(path, f"{image_id}.jpg")
                        with open(image_path, 'wb') as f:
                            f.write(response.content)
                        logger.info(f"Successfully downloaded and saved {image_id}.jpg to {path}")
                    except Exception as e:
                        logger.error(f"Failed to save {image_id}.jpg to {path}: {str(e)}")
                return True
        except Exception as e:
            logger.error(f"Failed to download {image_id}.jpg from {url}: {str(e)}")
            continue
    
    return False

def main():
    """Main function to check and download missing images"""
    for image_id in MISSING_IMAGES:
        if verify_image_exists(image_id):
            logger.info(f"Image {image_id}.jpg already exists")
            continue
            
        logger.info(f"Attempting to download {image_id}.jpg")
        if download_image(image_id):
            logger.info(f"Successfully processed {image_id}.jpg")
        else:
            logger.error(f"Failed to download {image_id}.jpg from all sources")

if __name__ == "__main__":
    main()
