import React, { useState } from "react";
import styles from "./cart-item.module.scss";
import ImageWithFallback from "@/components/ImageWithFallback";
import Link from "next/link";
import { removeFromCart } from "@/firebase/product";
import { useCart } from "@/hooks/cart.hook";

export default function CartItem({
  id,
  brand,
  name,
  price,
  sale_price,
  image,
  count,
  ...props
}) {
  const [isRemoving, setIsRemoving] = useState(false);
  const effectivePrice = ((sale_price || price) * 83 * (count || 1));
  const { data: cartData } = useCart();

  const handleRemove = async () => {
    if (isRemoving) return;

    try {
      setIsRemoving(true);
      await removeFromCart(id);
    } catch (error) {
      console.error('Error removing item from cart:', error);
      // You could implement a toast notification here
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className={styles.cartItem}>
      <Link href={`/product/${id}`} className={styles.imageContainer}>
        <ImageWithFallback
          src={image}
          alt={name}
          className={styles.image}
        />
      </Link>
      <div className={styles.textContainer}>
        <div className={styles.header}>
          <div>
            <h4 className={styles.brandText}>{brand}</h4>
            <h4>{name}</h4>
            <div className={styles.quantityContainer}>
              <span>Quantity: {count || 1}</span>
            </div>
          </div>
          <button
            className={`${styles.removeButton} ${isRemoving ? styles.loading : ''}`}
            onClick={handleRemove}
            disabled={isRemoving}
          >
            {isRemoving ? 'Removing...' : 'Remove'}
          </button>
        </div>
        <div className={styles.priceContainer}>
          <span className={styles.price}>
            ₹{effectivePrice.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
}
