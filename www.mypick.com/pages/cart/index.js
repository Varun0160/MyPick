import Head from "next/head";
import styles from "./cart.module.scss";
import Layout from "components/Layout";
import CartItem from "@/components/CartItem";
import { useCart } from "hooks/cart.hook";
import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/firebase/context";
import { useRouter } from "next/router";

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: cartData, loading: cartLoading, error: cartError } = useCart();
  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const cartLength = Object.keys(cartData || {}).reduce((a, b) => a + (cartData[b]?.length || 0), 0);

  useEffect(() => {
    const fetchCartProducts = async () => {
      if (!cartLength) {
        setCartProducts([]);
        setLoading(false);
        return;
      }

      try {
        const productIds = Object.keys(cartData || {});
        const productsData = [];

        // Fetch product details for each item in cart
        for (const id of productIds) {
          const productRef = doc(db, "Products", id);
          const productDoc = await getDoc(productRef);
          if (productDoc.exists()) {
            const productData = productDoc.data();
            productsData.push({
              id,
              ...productData,
              count: cartData[id]?.length || 0
            });
          }
        }

        setCartProducts(productsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching cart products:', err);
        setError('Failed to load cart items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (!cartLoading && !authLoading) {
      fetchCartProducts();
    }
  }, [cartData, cartLength, cartLoading, authLoading]);

  // Redirect to login if not authenticated
  if (!authLoading && !user && typeof window !== "undefined") {
    router.push("/login");
    return null;
  }

  // Calculate total amount
  const totalAmount = cartProducts.reduce((total, item) => {
    const price = item.sale_price || item.price || 0;
    return total + (price * 83 * (item.count || 1));
  }, 0);

  // Show loading state
  if (loading || authLoading || cartLoading) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.loading}>
            <h2>Loading cart...</h2>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error || cartError) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.error}>
            <h2>{error || cartError}</h2>
            <button
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <Head>
          <title>My Cart - MyPick</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <div className={styles.header}>
            <h1 className={styles.title}>My Cart</h1>
            <h4>You have {cartLength} items in your cart</h4>
          </div>

          {cartLength === 0 ? (
            <div className={styles.emptyCart}>
              <h2>Your cart is empty</h2>
              <button
                className={styles.shopButton}
                onClick={() => router.push('/category/Apparel')}
              >
                Shop Now
              </button>
            </div>
          ) : (
            <>
              <div className={styles.cartItems}>
                {cartProducts.map((product) => (
                  <CartItem
                    key={product.id}
                    id={product.id}
                    brand={product.brand}
                    name={product.productDisplayName}
                    price={product.price}
                    sale_price={product.sale_price}
                    image={product.link}
                    count={product.count}
                  />
                ))}
              </div>
              
              <div className={styles.cartSummary}>
                <h3>Cart Summary</h3>
                <div className={styles.cartTotal}>
                  <span>Total Items:</span>
                  <span>{cartLength}</span>
                </div>
                <div className={styles.cartTotal}>
                  <span>Total Amount:</span>
                  <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <button
                  className={styles.checkoutButton}
                  onClick={() => {/* Implement checkout logic */}}
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </Layout>
  );
}
