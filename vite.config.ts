import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@pages': path.resolve(__dirname, './src/pages'),
    },
  },
  build: {
    // Output directory
    outDir: 'dist',
    // Generate sourcemaps for production (optional, disable for smaller build)
    sourcemap: false,
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Rollup options
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Core React
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Firebase
          'firebase-vendor': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage',
          ],
          // UI libraries
          'ui-vendor': ['react-hot-toast', 'lodash'],
        },
      },
    },
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});