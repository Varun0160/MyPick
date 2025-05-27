import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

export default function emailLogin({ email, password }) {
  return signInWithEmailAndPassword(auth, email, password);
}

