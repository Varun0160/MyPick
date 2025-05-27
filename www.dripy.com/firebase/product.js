import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
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
  if (!auth.currentUser?.uid) return;

  const userRef = doc(db, "Users", auth.currentUser.uid);
  return updateDoc(userRef, {
    cart: newCart,
  });
}

export { addFavorite, removeFavorite, addToCart };
