import React, { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard/product-card";
import { db } from "@/config/firebase";
import { useAuth } from "@/firebase/context";
import Layout from "components/Layout";
import Head from "next/head";
import { collection, query, where, getDocs } from "firebase/firestore";
import styles from "./imageSearch.module.scss";

const API_BASE_URL = 'http://127.0.0.1:5000';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export default function ImageSearch() {
  const { user, loading } = useAuth();
  const [linkVal, setLinkVal] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState("unknown");

  // Check server status periodically
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (response.ok) {
          const data = await response.json();
          setServerStatus(data.status === "healthy" ? "running" : "error");
        } else {
          setServerStatus("error");
        }
      } catch (err) {
        setServerStatus("error");
      }
    };

    // Check immediately and then every 5 seconds
    checkServer();
    const interval = setInterval(checkServer, 5000);
    return () => clearInterval(interval);
  }, []);

  const retryWithDelay = async (fn, retries = MAX_RETRIES) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
      }
    }
  };

  const fetchRecommendations = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setError(null);
    setSearchResults([]);

    try {
      // Validate URL
      try {
        new URL(linkVal);
      } catch {
        throw new Error("Please enter a valid image URL");
      }

      if (serverStatus !== "running") {
        throw new Error("Image search server is not running. Please wait while we try to connect...");
      }

      console.log('Fetching recommendations from:', linkVal);
      
      const requestUrl = `${API_BASE_URL}/api/image-search?url=${encodeURIComponent(linkVal)}`;

      const response = await retryWithDelay(async () => {
        const res = await fetch(requestUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || `Server error: ${res.status}`);
        }

        return data;
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to process image');
      }

      if (!Array.isArray(response.result)) {
        throw new Error('Invalid response format');
      }

      if (response.result.length === 0) {
        throw new Error('No similar products found');
      }

      // Fetch product details from Firestore
      const productsRef = collection(db, "Products");
      const products = [];

      for (const id of response.result) {
        const q = query(productsRef, where("id", "==", id.toString()));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() });
        });
      }

      setSearchResults(products);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <Head>
          <title>Image Search - Dripy</title>
          <meta name="description" content="Search for similar fashion items" />
        </Head>

        <main className={styles.main}>
          <div className={styles.searchContainer}>
            <h1>Image Search</h1>
            <p>Find similar fashion items by providing an image URL</p>

            {serverStatus === "error" && (
              <div className={styles.warning}>
                Warning: Image search server is not running. Some features may not work.
              </div>
            )}

            <form onSubmit={fetchRecommendations} className={styles.searchForm}>
              <input
                type="url"
                value={linkVal}
                onChange={(e) => setLinkVal(e.target.value)}
                placeholder="Paste image URL here..."
                required
                className={styles.searchInput}
              />
              <button
                type="submit"
                className={styles.searchButton}
                disabled={isSearching || serverStatus !== "running"}
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </form>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.searchInfo}>
              {searchResults.length > 0 && (
                <p>Found {searchResults.length} similar products</p>
              )}
            </div>
          </div>

          <div className={styles.products}>
            {searchResults.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                brand={product.sellers}
                name={product.productDisplayName}
                image={product.link}
                price={product.price}
                favorite={user?.favorites?.includes(product.id)}
              />
            ))}
          </div>
        </main>
      </div>
    </Layout>
  );
}