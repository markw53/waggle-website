// src/config/theme.ts

export const COLORS = {
    primary: "#BDB76B",
    secondary: "#81b0ff",
    background: "#f5f5f5",
    white: "#FFFFFF",
    black: "#000000",
    text: {
        primary: "#333333",
        secondary: "#666666",
        light: "#999999",
    },
    error: "#dc3545",
    success: "#4CAF50",
    warning: "#FFC107",
};

export const themes = {
    light: {
        colors: {
            ...COLORS,
            background: "#f5f5f5",
            surface: "#FFFFFF",
            text: COLORS.text.primary,
            border: "#dddddd",
        },
        shadows: {
            small: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3.84,
                elevation: 2,
            },
            medium: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.15,
                shadowRadius: 5,
                elevation: 4,
            },
        },
    },
    dark: {
        colors: {
            ...COLORS,
            background: "#121212",
            surface: "#1E1E1E",
            text: COLORS.white,
            border: "#333333",
        },
        shadows: {
            small: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 2,
            },
            medium: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 4,
            },
        },
    },
};
