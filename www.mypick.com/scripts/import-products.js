require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, deleteDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PRODUCT_LIMIT = 2000;
const results = [];

async function importProducts() {
  const csvPath = path.join(__dirname, '..', '..', 'datasets', 'MyPick fashion dataset.csv');
  
  console.log('Reading CSV from:', csvPath);
  
  // First check if products already exist
  const productsRef = collection(db, 'Products');
  const existingProducts = await getDocs(productsRef);
  // Delete existing products first
  const snapshots = await getDocs(productsRef);
  console.log(`Found ${snapshots.size} existing products. Deleting...`);
  
  const deletePromises = [];
  snapshots.forEach((doc) => {
    deletePromises.push(deleteDoc(doc.ref));
  });
  
  await Promise.all(deletePromises);
  console.log('All existing products deleted.');

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        if (results.length < PRODUCT_LIMIT) {
          // Only add products that have an image ID between 10000 and 12000
          const imageId = parseInt(data.id);
          if (imageId >= 10000 && imageId < 12000) {
            // Add a random price if not present
            if (!data.price) {
              data.price = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;
            }
            
            // Format the masterCategory
            data.masterCategory = data.masterCategory.trim();
              // Add image link with correct API URL
            data.link = `http://localhost:5000/images/${data.id}.jpg`;
            
            results.push(data);
          }
        }
      })
      .on('end', async () => {
        console.log(`CSV file successfully processed. Found ${results.length} products`);
        
        try {
          let count = 0;
          
          for (const product of results) {
            if (count >= PRODUCT_LIMIT) break;
            
            // Convert numeric fields
            product.price = parseFloat(product.price) || Math.floor(Math.random() * 2000) + 500; // Random price if not set
            
            // Add the product to Firestore with retries
            let retryCount = 0;
            const maxRetries = 3;
            
            while (retryCount < maxRetries) {
              try {
                await addDoc(productsRef, {
                  ...product,
                  id: product.id,
                  masterCategory: product.masterCategory?.trim() || 'Apparel',
                  subCategory: product.subCategory?.trim() || 'Topwear',
                  sellers: product.sellers || 'MyPick',
                  productDisplayName: product.productDisplayName || `Product ${product.id}`,
                  link: product.link,
                  price: product.price
                });
                break; // Success, exit retry loop
              } catch (error) {
                retryCount++;
                if (retryCount === maxRetries) {
                  throw error; // Give up after max retries
                }
                console.log(`Retry ${retryCount} for product ${product.id}`);
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
              }
            }
            
            count++;
            if (count % 100 === 0) {
              console.log(`Progress: ${count}/${PRODUCT_LIMIT} products imported`);
            }
          }
          
          console.log(`Successfully imported ${count} products to Firestore`);
          resolve();
        } catch (error) {
          console.error('Error importing products:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
  });
}

async function importSportsProducts() {
  const csvPath = path.join(__dirname, '..', '..', 'datasets', 'sports-products.csv');
  
  console.log('Reading sports products CSV from:', csvPath);
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        console.log(`CSV file successfully processed. Found ${results.length} sports products`);
        
        try {
          const productsRef = collection(db, 'Products');
          
          for (const product of results) {
            try {
              await addDoc(productsRef, {
                ...product,
                id: product.id,
                masterCategory: 'Sporting Goods',
                price: parseFloat(product.price)
              });
              console.log(`Added sports product: ${product.productDisplayName}`);
            } catch (error) {
              console.error(`Error adding sports product ${product.id}:`, error);
            }
          }
          
          console.log('Successfully imported all sports products');
          resolve();
        } catch (error) {
          console.error('Error importing sports products:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading sports CSV:', error);
        reject(error);
      });
  });
}

// Run the imports
async function runImports() {
  try {
    await importProducts();
    await importSportsProducts();
    console.log('All imports completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

runImports();
