import Head from "next/head";
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

  console.log("Category Data:", data);
  console.log("Category Error:", error);

  let formattedName = query.category;
  if(query.category.includes("_")) {
    formattedName = query.category.replace("_", " ");
  }

  return (
    <Layout>      <div className={styles.container}>
        <Head>
          <title>{formattedName ? formattedName + " - Dripy" : "Dripy"}</title>
          <meta name="description" content={`Shop ${formattedName} on Dripy`} />
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
            {!loading && data && data.length > 0 ? (
              data.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  brand={product.sellers}
                  name={product.productDisplayName}
                  image={product.link}
                  price={product.price + 142}
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

    data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
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
