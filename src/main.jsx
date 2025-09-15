// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import { FinansProvider } from './context/FinansContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // YENİ IMPORT

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* YENİ SARMALAYICI (EN DIŞTA) */}
        <FinansProvider>
          <App />
        </FinansProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);