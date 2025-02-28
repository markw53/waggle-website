// src/components/ui/Logo.tsx
import Link from 'next/link';
import { Image } from './Image';
import { IMAGES } from '../../config/assets';

interface LogoProps {
  type?: 'full' | 'icon';
  className?: string;
}

export function Logo({ type = 'full', className }: LogoProps) {
  return (
    <Link href="/" className={`block ${className}`}>
      <Image
        src={type === 'full' ? IMAGES.LOGO.FULL : IMAGES.LOGO.ICON}
        alt="Waggle"
        className="h-auto w-auto"
        width={type === 'full' ? 120 : 32}
        height={type === 'full' ? 40 : 32}
        priority
      />
    </Link>
  );
}