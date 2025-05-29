export default {
  darkMode: 'class', // Enable dark mode support
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3b82f6', // Light blue
          DEFAULT: '#2563eb', // Blue
          dark: '#1d4ed8', // Dark blue
        },
        secondary: {
          light: '#fbbf24', // Light yellow
          DEFAULT: '#f59e0b', // Yellow
          dark: '#d97706', // Dark yellow
        },
        background: {
          light: '#f9fafb', // Light gray
          DEFAULT: '#f3f4f6', // Gray
          dark: '#111827', // Dark gray
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
