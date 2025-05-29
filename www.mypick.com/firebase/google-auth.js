import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export default function googleAuth() {
  const provider = new GoogleAuthProvider();
  
  return signInWithPopup(auth, provider)
    .then(async function (result) {
      const userRef = doc(db, "Users", result.user.uid);
      const docSnap = await getDoc(userRef);
      
      if (!docSnap.exists()) {
        await setDoc(userRef, {
          email: result.user.email,
          name: result.user.displayName?.split(' ')[0] || '',
          surname: result.user.displayName?.split(' ')[1] || '',
          addresses: [],
          cart: {},
          favorites: [],
          orders: [],
          phoneNumber: "",
          photoUrl: result.user.photoURL || null,
        });
      }
      return result;
    })
    .catch(function (error) {
      console.error("Google Auth Error: ", error);
      throw error;
    });
}
