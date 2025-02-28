// src/components/ui/Avatar.tsx
import { Image } from './Image';
import { IMAGES } from '../../config/assets';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

export function Avatar({ 
  src, 
  alt, 
  size = 'md', 
  className 
}: AvatarProps) {
  return (
    <div className={`relative ${sizeMap[size]} ${className}`}>
      <Image
        src={src || IMAGES.PLACEHOLDERS.AVATAR}
        alt={alt}
        className="rounded-full"
        width={size === 'lg' ? 64 : size === 'md' ? 48 : 32}
        height={size === 'lg' ? 64 : size === 'md' ? 48 : 32}
      />
    </div>
  );
}