import React from 'react';
import ReactDOM from 'react-dom/client';
import './app/globals.css';  // or whatever the correct path is
import App from './App';
import { AuthProvider } from './context/AuthProvider';
import { ThemeProvider } from './context/theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>  
    </ThemeProvider>
  </React.StrictMode>
);