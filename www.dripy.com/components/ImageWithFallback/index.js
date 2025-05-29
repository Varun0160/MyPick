import React from 'react';
import styles from './image.module.scss';

export default function ImageWithFallback({ src, alt, className, ...props }) {
  return (
    <img
      {...props}
      src={src || '/images/placeholder.jpg'}
      alt={alt || 'Product image'}
      className={`${styles.image} ${className || ''}`}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = '/images/placeholder.jpg';
      }}
      loading="lazy"
    />
  );
}
