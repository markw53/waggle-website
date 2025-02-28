// src/config/assets.ts
export const ASSETS = {
    IMAGES: {
      LOGO: {
        FULL: '/images/logos/full-logo.png',
        ICON: '/images/logos/icon-logo.png',
      },
      BACKGROUNDS: {
        HERO: '/images/backgrounds/hero-bg.jpg',
        AUTH: '/images/backgrounds/auth-bg.jpg',
      },
      PLACEHOLDERS: {
        DOG: '/images/placeholders/dog-placeholder.png',
        AVATAR: '/images/placeholders/avatar-placeholder.png',
      },
    },
    FONTS: {
      PRIMARY: {
        REGULAR: 'font-normal',
        MEDIUM: 'font-medium',
        SEMIBOLD: 'font-semibold',
        BOLD: 'font-bold',
      },
    },
    COLORS: {
      PRIMARY: {
        DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
        LIGHT: 'rgb(var(--color-primary-light) / <alpha-value>)',
        DARK: 'rgb(var(--color-primary-dark) / <alpha-value>)',
      },
      // Add other color definitions
    },
  } as const;