import React from 'react';
import ReactDOM from 'react-dom/client';
import './app/globals.css';  // or whatever the correct path is
import App from '@/App';
import { AuthProvider } from '@/context/AuthProvider';
import { ThemeProvider } from '@/context/theme';
import ErrorBoundary from '@/components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>  
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);