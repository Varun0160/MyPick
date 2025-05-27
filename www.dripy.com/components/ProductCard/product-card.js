import React, { useState } from "react";

import styles from "./product.module.scss";
import HeartIcon from "@/icons/heart";
import Link from "next/link";
import HeartFilled from "@/icons/heart-filled";
import { addFavorite, removeFavorite, addToCart } from "@/firebase/product";
import { useRouter } from "next/router";
import { useAuth } from "@/firebase/context";
import { useCart } from "hooks/cart.hook";

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
  const { user, loading } = useAuth();
  const { data: cartData } = useCart();
  const router = useRouter();

  const removeEvent = (id) => {
    removeFavorite(id);
    setFavorite(false);
  };
  const addEvent = (id) => {
    addFavorite(id);
    setFavorite(true);
  };

  const favoriteEvent = (e) => {
    e.stopPropagation();
    if (user && !loading) {
      isFavorite ? removeEvent(id) : addEvent(id);
    } else {
      typeof window !== "undefined" && router.push("/login");
    }
  };

  const addToCartHandler = (e) => {
    e.stopPropagation(); // Prevent product page navigation
    if (user && !loading) {
      const newCart = {
        ...cartData,
        [id]: cartData.hasOwnProperty(id) ? [...cartData[id], "-"] : ["-"],
      };
      addToCart(newCart);
    } else {
      typeof window !== "undefined" && router.push("/login");
    }
  };

  const goToProduct = (target) => {
    if (target?.localName !== "button") {
      typeof window !== "undefined" && router.push(`/${id}`);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "/images/placeholder.jpg";
    if (imageUrl.startsWith("http")) return imageUrl;

    // Handle relative paths from the API server
    const filename = imageUrl.split("/").pop();
    return `http://localhost:5000/images/${filename}`;
  };

  return (
    <div
      className={styles.container}
      style={{
        backgroundColor: bgColor || "",
      }}
      onClick={(e) => goToProduct(e.target)}
      {...props}
    >
      <div className={styles.buttonContainer}>
        <button className={styles.favContainer} onClick={favoriteEvent}>
          {isFavorite ? (
            <HeartFilled width={16} height={16} />
          ) : (
            <HeartIcon width={16} height={16} />
          )}
        </button>
        <button className={styles.cartButton} onClick={addToCartHandler}>
          Add to Cart
        </button>
      </div>
      <div className={styles.imageContainer}>
        <img
          className={styles.image}
          src={getImageUrl(image)}
          loading="lazy"
          alt={name || "Product image"}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/images/placeholder.jpg";
          }}
        />
      </div>
      <div className={styles.textContainer}>
        <Link href={`/brand/${brand}`}>
          <h4 className={styles.brandText}>{brand}</h4>
        </Link>
        <h4>{name}</h4>
        {sale_price ? (
          <div className={styles.priceContainer}>
            <div className={styles.discount}>
              {(((price - sale_price) / price) * 100) | 0}%
            </div>
            <div className={styles.prices}>
              <span className={styles.priceText}>{price}$</span>
              <span className={styles.salePriceText}>{sale_price}$</span>
            </div>
          </div>
        ) : (
          <span className={styles.price}>{price || 0}$</span>
        )}
      </div>
    </div>
  );
}
