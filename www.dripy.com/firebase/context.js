import React, { useState, useEffect, useContext, createContext } from "react";
import { firebase, auth, db } from "../config/firebase";

const authContext = createContext();

export function AuthProvider({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = () => {
  return useContext(authContext);
};

function useProvideAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCurrentUser = () => {
    if (auth.currentUser?.uid) {
      db.collection("Users")
        .doc(auth.currentUser.uid)
        .get()
        .then((doc) => {
          setUser(doc.data());
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => getCurrentUser());
    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    setUser,
  };
}
