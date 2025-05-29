import React from "react";

import styles from "./vertical.module.scss";
import HeartIcon from "@/icons/heart";
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";

export default function VerticalCard({
  bgColor,
  brand,
  name,
  price,
  sale_price,
  image,
  border,
  href,
  ...props
}) {  return (
    <Link 
      href={href || "#"} 
      className={styles.verticalCard}
      style={{
        backgroundColor: bgColor || "",
        border: border && "2px solid #eee",
      }}
    >
      {sale_price && price && (
        <button className={styles.favContainer}>
          {(((price - sale_price) / price) * 100) | 0}%
        </button>
      )}
      <div className={styles.imageContainer}>
        <ImageWithFallback
          src={image}
          alt={name}
          className={styles.image}
        />
      </div>
      <div className={styles.textContainer}>
        <h4 className={styles.brandText}>{brand}</h4>
        <h4>{name}</h4>
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
  );
}
