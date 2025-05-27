import { useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { collection, doc, onSnapshot } from "firebase/firestore";

const useOrders = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;

    const fetchFromFirestore = () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "Users", auth.currentUser.uid);

        unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            setData(userData.orders || []);
          } else {
            setData([]);
          }
          setLoading(false);
        });
      } else {
        setData([]);
        setLoading(false);
      }
    };

    fetchFromFirestore();
    return () => unsubscribe && unsubscribe();
  }, []);

  return {
    data,
    loading,
  };
};

export { useOrders };
