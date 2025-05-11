import { db, auth } from "../config/firebase";
import { arrayUnion, arrayRemove } from "firebase/firestore";

function addFavorite(id) {
  const currentUser = auth.currentUser.uid;

  return db
    .collection("Users")
    .doc(currentUser)
    .update({
      favorites: arrayUnion(id),
    });
}

function removeFavorite(id) {
  const currentUser = auth.currentUser.uid;

  return db
    .collection("Users")
    .doc(currentUser)
    .update({
      favorites: arrayRemove(id),
    });
}

function addToCart(newCart) {
  const currentUser = auth.currentUser.uid;

  return db.collection("Users").doc(currentUser).update({
    cart: newCart,
  });
}

export { addFavorite, removeFavorite, addToCart };
