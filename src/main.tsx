import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/app/globals.css';  
import App from '@/App';
import { AuthProvider } from '@/context/AuthProvider';
import { ThemeProvider } from '@/context/theme';
import ErrorBoundary from '@/components/ErrorBoundary';
import { initSentry } from '@/lib/sentry';
import { HelmetProvider } from 'react-helmet-async';

initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>  
        </ThemeProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);