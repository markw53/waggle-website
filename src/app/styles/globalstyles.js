
// src/styles/globalStyles.js
export const globalStyles = {
    fontFamily: 'Merienda',
    fonts: {
        regular: 'Merienda',
        medium: 'Merienda-Medium',
        bold: 'Merienda-Bold',
        light: 'Merienda-Light'
    },
    // You can add more global styles here
    colors: {
        primary: '#BDB76B',
        secondary: '#666666',
        text: '#333333',
        error: '#dc3545',
        success: '#4CAF50',
        background: '#f5f5f5',
        white: '#ffffff',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },
    borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
    },
    shadows: {
        small: {
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 2,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
    },
    typography: {
        h1: {
            fontFamily: 'Merienda-Bold',
            fontSize: 32,
            lineHeight: 40,
        },
        h2: {
            fontFamily: 'Merienda-Bold',
            fontSize: 24,
            lineHeight: 32,
        },
        h3: {
            fontFamily: 'Merienda-Medium',
            fontSize: 20,
            lineHeight: 28,
        },
        body: {
            fontFamily: 'Merienda',
            fontSize: 16,
            lineHeight: 24,
        },
        caption: {
            fontFamily: 'Merienda-Light',
            fontSize: 14,
            lineHeight: 20,
        },
    }
};
