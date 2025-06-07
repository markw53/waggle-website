export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Keep your named color variants
        custom: {
          primary: {
            light: '#3b82f6',
            DEFAULT: '#2563eb',
            dark: '#1d4ed8',
          },
          secondary: {
            light: '#fbbf24',
            DEFAULT: '#f59e0b',
            dark: '#d97706',
          },
          background: {
            light: '#f9fafb',
            DEFAULT: '#f3f4f6',
            dark: '#111827',
          },
        },

        // ShadCN tokens
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
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
    require('tailwindcss-animate'),
  ],
}
// This Tailwind CSS configuration file sets up dark mode, specifies content paths,
// extends the theme with custom colors and font families, and includes plugins for forms,
// typography, and animations. It also integrates ShadCN design tokens for consistent styling.
// The custom colors include primary and secondary variants, as well as background colors for light and dark modes.
// The font families include sans-serif, serif, and monospace options for typography consistency.
// The plugins enhance the functionality of Tailwind CSS, providing better form styles, typography utilities, and animation capabilities.
// The configuration is designed to be modular and easily extendable for future design needs.
// The use of ShadCN tokens allows for a consistent design language across the application, making it easier to maintain and update styles.
// The configuration is compatible with modern JavaScript and TypeScript projects, ensuring a smooth development experience.
// The file is structured to be easily readable and maintainable, following best practices for Tailwind CSS configurations.
// The use of `export default` allows for easy import and integration into a larger project setup.
// The configuration is optimized for performance, ensuring that only the necessary styles are included in the final build.
// The use of `hsl(var(--color))` allows for dynamic theming and easy color adjustments without needing to change the underlying CSS.
// The configuration supports both light and dark modes, providing a better user experience across different environments.
// The file is designed to be used with modern build tools and frameworks, ensuring compatibility with the latest web standards.      