import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db, auth } from "../config/firebase";

async function addFavorite(id) {
  if (!auth.currentUser?.uid) return;

  const userRef = doc(db, "Users", auth.currentUser.uid);
  return updateDoc(userRef, {
    favorites: arrayUnion(id),
  });
}

async function removeFavorite(id) {
  if (!auth.currentUser?.uid) return;

  const userRef = doc(db, "Users", auth.currentUser.uid);
  return updateDoc(userRef, {
    favorites: arrayRemove(id),
  });
}

async function addToCart(newCart) {
  if (!auth.currentUser?.uid) {
    throw new Error("User not authenticated");
  }

  try {
    const userRef = doc(db, "Users", auth.currentUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document not found");
    }

    // Validate cart structure
    if (typeof newCart !== 'object') {
      throw new Error("Invalid cart format");
    }

    // Filter out any invalid entries
    const validatedCart = Object.fromEntries(
      Object.entries(newCart).filter(([_, quantities]) => 
        Array.isArray(quantities) && quantities.length > 0
      )
    );

    await updateDoc(userRef, {
      cart: validatedCart,
    });

    return validatedCart;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
}

async function removeFromCart(productId) {
  if (!auth.currentUser?.uid) {
    throw new Error("User not authenticated");
  }

  try {
    const userRef = doc(db, "Users", auth.currentUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document not found");
    }

    const currentCart = userDoc.data()?.cart || {};

    if (!currentCart[productId]) {
      throw new Error("Product not found in cart");
    }

    // Remove the product from cart
    delete currentCart[productId];

    // Update cart in Firestore
    await updateDoc(userRef, {
      cart: currentCart,
    });

    return currentCart;
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
}

export { addFavorite, removeFavorite, addToCart, removeFromCart };
