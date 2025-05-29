require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc, collection, addDoc } = require('firebase/firestore');

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

async function updateProduct() {
  console.log('Starting product update...');
  try {
    // Get the document reference for product 11153
    console.log('Getting product reference...');
    const productRef = doc(db, 'Products', '11153');
    console.log('Fetching product document...');
    const productDoc = await getDoc(productRef);

    if (!productDoc.exists()) {
      console.log('Product 11153 not found. Creating new product...');
      // Create new product document
      const newProductData = {
        id: '11153',
        image: '17367.jpg',
        productDisplayName: 'Arrow Men Formal Maroon Tie+Cufflink+Pocket square - Combo Pack',
        brand: 'Arrow',
        gender: 'Men',
        masterCategory: 'Accessories',
        subCategory: 'Ties',
        articleType: 'Ties',
        baseColor: 'Maroon',
        season: 'Fall',
        year: 2011,
        usage: 'Formal',
        price: 1071,
        sellers: 'Blue Smoke',
        sold: 1464
      };
      console.log('Creating new product with data:', newProductData);
      await addDoc(collection(db, 'Products'), newProductData);
      console.log('Successfully created new product');
      return;
    }

    console.log('Product found, updating...');
    // Update the product with the new image ID
    await updateDoc(productRef, {
      image: '17367.jpg',
      productDisplayName: 'Arrow Men Formal Maroon Tie+Cufflink+Pocket square - Combo Pack',
      brand: 'Arrow'
    });

    console.log('Successfully updated product 11153');
  } catch (error) {
    console.error('Error updating product:', error.stack);
    process.exit(1);
  }
}

updateProduct();
