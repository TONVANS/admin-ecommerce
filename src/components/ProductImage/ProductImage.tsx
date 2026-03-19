// src/components/ProductImage/ProductImage.tsx
import React, { useState } from 'react';
import Image from 'next/image';

interface ProductImageProps {
  pimg?: string | null;
  title: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({
  pimg,
  title,
  width = 60,
  height = 50,
  className = "aspect-[6/5] w-15 rounded-[5px] object-cover",
  fallbackSrc = '/placeholder-image.jpg'
}) => {
  const [imgSrc, setImgSrc] = useState(() => getImageUrl(pimg));
  const [hasError, setHasError] = useState(false);

  // Helper function to get image URL
  function getImageUrl(imageName: string | null | undefined): string {
    if (!imageName) return fallbackSrc;
    
    // If imageName already contains full URL, use as is
    if (imageName.startsWith('http')) return imageName;
    
    // Otherwise, construct URL with API base
    return `${process.env.NEXT_PUBLIC_API_URL}/upload/product/${imageName}`;
  }

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <Image
      src={imgSrc}
      className={className}
      width={width}
      height={height}
      alt={`Image for product ${title}`}
      role="presentation"
      onError={handleError}
      priority={false}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyuHI/E1l1EMQE1H0U1V1MN6EYyMy9vg6Pv2MgNgKNS7eLCa/eFgGdIiRekYgY4fVGIAABuIKApEKu7haxWz8K4qcvBBk3MidNKKC36vKN8S9qnuHe0vfN5NWl4ksXY8HFN2a8bUKwOQAAAHYHXNNvh4s=vfN5N"
    />
  );
};

export default ProductImage;