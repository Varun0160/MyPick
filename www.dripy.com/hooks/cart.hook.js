import { useState, useEffect } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export const useCart = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;

    const fetchFromFirestore = () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "Users", auth.currentUser.uid);

        unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            setData(userData.cart || {});
          } else {
            setData({});
          }
          setLoading(false);
        });
      } else {
        setData({});
        setLoading(false);
      }
    };

    fetchFromFirestore();
    return () => unsubscribe && unsubscribe();
  }, []);

  return { data, loading };
};
