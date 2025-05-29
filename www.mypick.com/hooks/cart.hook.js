import { useState, useEffect } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export const useCart = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = null;

    const fetchFromFirestore = () => {
      // Clear data when no user is logged in
      if (!auth.currentUser) {
        setData({});
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "Users", auth.currentUser.uid);

        // Subscribe to real-time updates
        unsubscribe = onSnapshot(
          userDocRef,
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              const userData = docSnapshot.data();
              const cartData = userData.cart || {};

              // Validate cart data structure
              const validCart = Object.fromEntries(
                Object.entries(cartData).filter(
                  ([_, quantities]) => Array.isArray(quantities) && quantities.length > 0
                )
              );

              setData(validCart);
            } else {
              setData({});
            }
            setLoading(false);
            setError(null);
          },
          (error) => {
            console.error("Error fetching cart:", error);
            setError(error.message);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Error setting up cart listener:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFromFirestore();

    // Clean up subscription on unmount or auth state change
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [auth.currentUser]); // Re-run effect when auth state changes

  return { data, loading, error };
};
