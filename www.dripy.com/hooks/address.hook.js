import { useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { collection, doc, onSnapshot } from "firebase/firestore";

const useAddresses = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const fetchFromFirestore = () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "Users", auth.currentUser.uid);

        unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            setData(userData.addresses || []);
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
    error,
  };
};

const useAddress = (id) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFromFirestore() {
      auth.currentUser &&
        db
          .collection("Addresses")
          .doc(id)
          .get()
          .then(function (doc) {
            setData(doc.data());
            setLoading(false);
          })
          .catch((e) => setError(e));
    }

    fetchFromFirestore();
  }, [auth.currentUser]);

  return {
    data,
    loading,
    error,
  };
};

export { useAddresses, useAddress };
