// tailwind.config.js
/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#BDB76B',
          dark: '#9B9B4F',
        },
        secondary: '#666666',
        background: 'var(--background)',
        text: {
          DEFAULT: 'var(--text)',
          secondary: 'var(--text-secondary)',
        },
      },
    },
  },
  plugins: [
    import('@tailwindcss/typography'), // Add this line
  ],
};

export default config;