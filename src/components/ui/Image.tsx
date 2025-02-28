// src/components/ui/Image.tsx
import NextImage from 'next/image';
import { useState } from 'react';
import { IMAGES } from '../../config/assets';

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fallback?: string;
}

export function Image({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  fallback = IMAGES.PLACEHOLDERS.DOG,
}: ImageProps) {
  const [error, setError] = useState(false);

  return (
    <NextImage
      src={error ? fallback : src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      onError={() => setError(true)}
    />
  );
}