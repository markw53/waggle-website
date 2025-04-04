import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Enables dark mode with the 'class' strategy
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        merienda: ["Merienda", "cursive"],
      },
      colors: {
        primary: "#BDB76B",
        secondary: "#666666",
        text: "#333333",
        background: "#f5f5f5",
        white: "#ffffff",
        error: "#dc3545",
        success: "#4CAF50",

        // 🌙 Dark mode overrides
        dark: {
          background: "#1a1a1a",
          surface: "#2a2a2a",
          text: "#f5f5f5",
          secondaryText: "#aaaaaa",
        },
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        small: "0 2px 4px rgba(0, 0, 0, 0.1)",
        medium: "0 4px 8px rgba(0, 0, 0, 0.25)",
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            color: theme("colors.text"),
            h1: {
              fontFamily: "Merienda-Bold",
              fontSize: "32px",
              lineHeight: "40px",
            },
            h2: {
              fontFamily: "Merienda-Bold",
              fontSize: "24px",
              lineHeight: "32px",
            },
            h3: {
              fontFamily: "Merienda-Medium",
              fontSize: "20px",
              lineHeight: "28px",
            },
            p: {
              fontFamily: "Merienda",
              fontSize: "16px",
              lineHeight: "24px",
            },
            caption: {
              fontFamily: "Merienda-Light",
              fontSize: "14px",
              lineHeight: "20px",
            },
          },
        },
        dark: {
          css: {
            color: theme("colors.dark.text"),
            backgroundColor: theme("colors.dark.background"),
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
