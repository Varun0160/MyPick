import React, { useState } from 'react';
import Image from 'next/image';

export default function OptimizedImage({ src, alt, ...props }) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      {...props}
      src={imgSrc || '/images/placeholder.jpg'}
      alt={alt || 'Product image'}
      onError={() => setImgSrc('/images/placeholder.jpg')}
      width={props.width || 300}
      height={props.height || 300}
    />
  );
}
