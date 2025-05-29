import React, { useState } from "react";
import styles from "./product.module.scss";
import HeartIcon from "@/icons/heart";
import Link from "next/link";
import HeartFilled from "@/icons/heart-filled";
import { addFavorite, removeFavorite, addToCart } from "@/firebase/product";
import { useRouter } from "next/router";
import { useAuth } from "@/firebase/context";
import { useCart } from "../../hooks/cart.hook";
import ImageWithFallback from "@/components/ImageWithFallback";

export default function ProductCard({
  bgColor,
  id,
  brand,
  name,
  price,
  sale_price,
  image,
  favorite,
  ...props
}) {
  const [isFavorite, setFavorite] = useState(favorite);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { user, loading } = useAuth();
  const { data: cartData } = useCart();
  const router = useRouter();

  const addEvent = async (id) => {
    if (!user) {
      router.push("/login");
      return;
    }
    await addFavorite(id);
    setFavorite(true);
  };

  const removeEvent = async (id) => {
    await removeFavorite(id);
    setFavorite(false);
  };

  const handleAddToCart = async () => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    try {
      setIsAddingToCart(true);
      const newCart = {
        ...cartData,
        [id]: cartData?.hasOwnProperty(id) ? [...cartData[id], 1] : [1]
      };
      await addToCart(newCart);
    } catch (error) {
      console.error('Error adding to cart:', error);
      // You can implement a toast notification here
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div
      className={styles.productCard}
      style={{
        backgroundColor: bgColor || "",
        border: props.border && "2px solid #eee",
      }}
    >
      {sale_price && price && (
        <div className={styles.discountContainer}>
          <span>{(((price - sale_price) / price) * 100) | 0}%</span>
        </div>
      )}
      <button
        className={styles.favContainer}
        onClick={() => !loading && (isFavorite ? removeEvent(id) : addEvent(id))}
      >
        {isFavorite ? (
          <HeartFilled width={24} height={24} />
        ) : (
          <HeartIcon width={24} height={24} />
        )}
      </button>
      <Link href={`/product/${id}`} className={styles.productLink}>
        <div className={styles.imageContainer}>
          <ImageWithFallback
            src={image}
            alt={name}
            className={styles.image}
          />
        </div>
        <div className={styles.textContainer}>
          <h4 className={styles.brandText}>{brand}</h4>
          <h4 className={styles.nameText}>{name}</h4>
          <div className={styles.priceInfo}>
            <span className={styles.priceText}>₹{(price * 83).toLocaleString('en-IN')}</span>
            {sale_price && (
              <span className={styles.salePriceText}>
                ₹{(sale_price * 83).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </Link>
      <button
        className={`${styles.addToCartButton} ${cartData?.hasOwnProperty(id) ? styles.added : ''} ${isAddingToCart ? styles.loading : ''}`}
        onClick={handleAddToCart}
        disabled={isAddingToCart}
      >
        {isAddingToCart ? 'Adding...' : (cartData?.hasOwnProperty(id) ? 'Added to Cart' : 'Add to Cart')}
      </button>
    </div>
  );
}
