import Head from "next/head";
import { useState } from "react";
import styles from "./product.module.scss";
import Button from "@/components/Button";
import { useAuth } from "@/firebase/context";
import { db } from "@/config/firebase";
import Layout from "@/components/Layout";
import ErrorPage from "../404";
import { collection, doc, getDoc, query, where, limit, getDocs } from 'firebase/firestore';

export default function Product({ data, recommendedProducts, query }) {
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const { user } = useAuth();

  if (!data || !data.productDisplayName) {
    return <ErrorPage />;
  }

  return (
    <Layout>
      <div className={styles.container}>        <Head>
          <title>{data.productDisplayName} | Dripy</title>
          <meta name="description" content={`Buy ${data.productDisplayName} from ${data.sellers} at Dripy`} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <div className={styles.photosContainer}>
            <div className={styles.carouselContainer}>
              <img 
                src={data.link.startsWith('http') ? data.link : `http://localhost:5000/images/${data.link.split('/').pop()}`} 
                alt={data.productDisplayName} 
              />
            </div>
          </div>

          <div className={styles.productInfos}>
            <div className={styles.header}>
              <h1 className={styles.productTitle}>{data.productDisplayName}</h1>
              <a>by {data.sellers}</a>
            </div>

            <div className={styles.priceContainer}>
              <span className={styles.priceText}>₹{data.price + 142}</span>
              <div className={styles.saleContainer}>
                <span className={styles.saleText}>₹{data.price}</span>
                <span className={styles.savedText}>Save ₹142 (10%)</span>
              </div>
            </div>

            <div className={styles.sizes}>
              <h4>Select Size</h4>
              {["XS", "S", "M", "L", "XL"].map((size) => (
                <button key={size}>{size}</button>
              ))}
            </div>

            <div className={styles.buttons}>
              <Button style={{ width: "100%", maxWidth: "350px" }}>
                Add to Cart
              </Button>
            </div>

            <div className={styles.infoContainer}>
              <h4>Product Details</h4>
              <p>{data.productDisplayName}</p>
              <p>Category: {data.masterCategory}</p>
              <p>Sub Category: {data.subCategory}</p>
            </div>
          </div>
        </main>

        {recommendedProducts && recommendedProducts.length > 0 && (
          <div className={styles.recommendContainer}>
            <h2>Recommended Products</h2>
            <div className={styles.products}>
              {recommendedProducts.map((product) => (
                <div key={product.id} className={styles.productCard}>
                  <img src={product.link} alt={product.productDisplayName} />
                  <h3>{product.productDisplayName}</h3>
                  <p>₹{product.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

Product.getInitialProps = async function ({ query }) {
  let data = null;
  let recommendedProducts = [];

  try {
    // Get single product
    const productRef = doc(db, "Products", query.product);
    const productDoc = await getDoc(productRef);
    
    if (productDoc.exists()) {
      data = {
        id: productDoc.id,
        ...productDoc.data()
      };

      // Get recommended products
      const productsRef = collection(db, "Products");
      const recommendedQuery = query(
        productsRef,
        where("masterCategory", "==", data.masterCategory),
        limit(4)
      );
      
      const querySnapshot = await getDocs(recommendedQuery);
      recommendedProducts = querySnapshot.docs
        .filter(doc => doc.id !== query.product) // Exclude current product
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
    }
  } catch (error) {
    console.error("Error fetching product:", error);
  }

  return {
    data,
    recommendedProducts,
    query
  };
};
