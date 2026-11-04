'use client';
import { FALLBACK_PRODUCT_IMAGE } from '@/lib/imageUtils';

export default function StoreImage({ src, alt = '', className = '', ...props }) {
  return (
    <img
      src={src || FALLBACK_PRODUCT_IMAGE}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
      }}
      {...props}
    />
  );
}
