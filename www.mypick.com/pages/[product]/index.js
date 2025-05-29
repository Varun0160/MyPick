import Head from "next/head";
import { useState } from "react";
import styles from "./product.module.scss";
import Button from "@/components/Button";
import { useAuth } from "@/firebase/context";
import { db } from "@/config/firebase";
import Layout from "@/components/Layout";
import ErrorPage from "../404";
import { collection, doc, getDoc, query, where, limit, getDocs } from 'firebase/firestore';
import ImageWithFallback from "@/components/ImageWithFallback";

export default function Product({ data, recommendedProducts, query }) {
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const { user } = useAuth();

  if (!data || !data.productDisplayName) {
    return <ErrorPage />;
  }

  const imageUrl = data.link.startsWith('http') 
    ? data.link 
    : `http://localhost:5000/images/${data.link.split('/').pop()}`;

  return (
    <Layout>
      <div className={styles.container}>
        <Head>          <title>{data.productDisplayName} | MyPick</title>
          <meta name="description" content={`Buy ${data.productDisplayName} from ${data.sellers} at MyPick`} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <div className={styles.photosContainer}>
            <div className={styles.carouselContainer}>
              <ImageWithFallback 
                src={imageUrl}
                alt={data.productDisplayName}
                className={styles.productImage}
              />
            </div>
          </div>
          
          <div className={styles.infoContainer}>
            <div className={styles.header}>
              <h1 className={styles.productTitle}>{data.productDisplayName}</h1>
              {data.sellers && <h2 className={styles.seller}>Sold by {data.sellers}</h2>}
            </div>              <div className={styles.priceContainer}>
                <span className={styles.price}>
                  ₹{((data.sale_price || data.price) * 83).toLocaleString('en-IN')}
                </span>
              </div>

            <div className={styles.description}>
              <h3>Product Details</h3>
              <p>{data.productDescription || "No description available"}</p>
            </div>

            <Button style={{ marginTop: 20 }} onClick={() => handleAddToCart(data.id)}>
              Add to Cart
            </Button>
          </div>
        </main>
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
