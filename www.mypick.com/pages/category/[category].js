import Head from "next/head";
import { useState, useEffect } from "react";
import styles from "./category.module.scss";
import Layout from "components/Layout";
import { useAuth } from "@/firebase/context";
import { db } from "@/config/firebase";
import Button from "@/components/FilterButton";
import ProductCard from "@/components/ProductCard/product-card";
import { collection, query, where, limit, getDocs } from 'firebase/firestore';

const getEmoji = {
  Apparel: "👚",
  Footwear: "👠",
  Accessories: "👜",
  'Sporting Goods': "🤸",
  'Personal Care': "🎁",
  Home: "🏡",
};

export default function Category({ data, query, error }) {
  const { user, loading } = useAuth();
  const [productData, setProductData] = useState(data);

  // Refresh data when component mounts or when URL changes
  useEffect(() => {
    if (query.category === "Apparel" || query.category === "apparel") {
      const refreshData = async () => {
        try {
          const result = await Category.getInitialProps({ query });
          setProductData(result.data);
        } catch (e) {
          console.error('Error refreshing data:', e);
        }
      };
      refreshData();
    } else {
      setProductData(data);
    }
  }, [query.category]);

  let formattedName = query.category;
  if(query.category.includes("_")) {
    formattedName = query.category.replace("_", " ");
  }

  return (
    <Layout>
      <div className={styles.container}>
        <Head>          <title>{formattedName ? formattedName + " - MyPick" : "MyPick"}</title>
          <meta name="description" content={`Shop ${formattedName} on MyPick`} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              <span className={styles.emoji}>{getEmoji[formattedName] || "🛍️"}</span>
              {formattedName}
            </h1>
            <div className={styles.headerButtons}>
              <Button type="sort" style={{ marginRight: 20 }} />
              <Button count={0} />
            </div>
          </div>
          <div className={styles.products}>
            {!loading && productData && productData.length > 0 ? (
              productData.map((product) => (
                <ProductCard
                  key={product.id + "-" + Math.random()} // Force re-render on refresh
                  id={product.id}
                  brand={product.sellers}
                  name={product.productDisplayName}
                  image={product.link}
                  price={formattedName === "Apparel" ? 
                    product.price + Math.floor(Math.random() * 200) : // Add random variation for apparel
                    product.price + 142}
                  sale_price={product.price}
                  favorite={user?.favorites?.includes(product.id)}
                />
              ))
            ) : (
              <div className={styles.noProducts}>
                {loading ? "Loading..." : "No products found in this category"}
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
}

Category.getInitialProps = async function ({ query: routeQuery }) {
  let data = {};
  let error = {};
  let formattedName = routeQuery.category;
  
  if(routeQuery.category.includes("_")) {
    formattedName = routeQuery.category.replace("_", " ");
  }

  console.log('Fetching products for category:', formattedName);

  try {
    const productsRef = collection(db, 'Products');
    console.log('Created products reference');

    const q = query(
      productsRef,
      where("masterCategory", "==", formattedName),
      limit(30)
    );
    console.log('Created query');
    
    const querySnapshot = await getDocs(q);
    console.log('Got query snapshot, size:', querySnapshot.size);

    // Get the products and add some randomness for prices
    data = querySnapshot.docs.map(doc => {
      const productData = doc.data();
      const basePrice = productData.price;
      
      // Add random variation to price for Apparel category
      if (formattedName === "Apparel") {
        const variation = Math.random() * 0.2 - 0.1; // -10% to +10%
        productData.price = Math.round(basePrice * (1 + variation));
      }
      
      return {
        id: doc.id,
        ...productData
      };
    });

    // Shuffle the array if it's the Apparel category
    if (formattedName === "Apparel" && data.length > 0) {
      for (let i = data.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [data[i], data[j]] = [data[j], data[i]];
      }
    }
    
    console.log('Mapped', data.length, 'products');
  } catch (e) {
    console.error('Error fetching products:', e);
    error = e;
  }

  return {
    data,
    error,
    query: routeQuery
  };
}
