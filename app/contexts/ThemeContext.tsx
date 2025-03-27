// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { themes, ThemeType } from "../config/theme";

type ThemeContextType = {
    theme: ThemeType;
    toggleTheme: () => void;
    colors: typeof themes.light.colors;
    shadows: typeof themes.light.shadows;
    isDark: boolean;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const getInitialTheme = (): ThemeType => {
        if (typeof window !== "undefined") {
            const storedTheme = localStorage.getItem("theme") as ThemeType | null;
            return storedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        }
        return "light";
    };

    const [theme, setTheme] = useState<ThemeType>(getInitialTheme);

    useEffect(() => {
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    }, []);

    const contextValue = useMemo(
        () => ({
            theme,
            toggleTheme,
            colors: themes[theme].colors,
            shadows: themes[theme].shadows,
            isDark: theme === "dark",
        }),
        [theme]
    );

    return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
