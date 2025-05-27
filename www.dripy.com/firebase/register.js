import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

function emailRegister({ email, password }) {
  return createUserWithEmailAndPassword(auth, email, password);
}

function registerDatabase({ id, email, name, surname }) {
  const userRef = doc(db, "Users", id);
  return setDoc(userRef, {
    name,
    surname,
    email,
    addresses: [],
    cart: {},
    favorites: [],
    orders: [],
    phoneNumber: "",
    photoUrl: null,
  });
}

function registerSellerDatabase({ id, email, name }) {
  const userRef = doc(db, "Users", id);
  return setDoc(userRef, {
    name,
    email,
    products: [],
    addresses: [],
    cart: {},
    favorites: [],
    orders: [],
    phoneNumber: "",
    photoUrl: null,
  });
}

export { emailRegister, registerDatabase, registerSellerDatabase };
