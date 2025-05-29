import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, getDocs, where } from "firebase/firestore";
import { db } from "@/config/firebase";

export const useProduct = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFromFirestore() {
      try {
        const productsRef = collection(db, "Products");
        const q = query(productsRef, where("id", "==", id));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setData({ id: doc.id, ...doc.data() });
        } else {
          setData(null);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setData(null);
        setLoading(false);
      }
    }

    if (id) {
      fetchFromFirestore();
    } else {
      setLoading(false);
    }
  }, [id]);

  return { data, loading };
};

export const useProducts = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFromFirestore() {
      try {
        const productsRef = collection(db, "Products");
        const querySnapshot = await getDocs(productsRef);
        const products = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(products);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setData([]);
        setLoading(false);
      }
    }

    fetchFromFirestore();
  }, []);

  return { data, loading };
};

export const useProductsByCategory = (category) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFromFirestore() {
      try {
        const productsRef = collection(db, "Products");
        const q = query(productsRef, where("masterCategory", "==", category));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(products);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products by category:", error);
        setData([]);
        setLoading(false);
      }
    }

    if (category) {
      fetchFromFirestore();
    } else {
      setLoading(false);
    }
  }, [category]);

  return { data, loading };
};
