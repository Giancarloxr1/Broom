import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Registra il service worker generato da vite-plugin-pwa.
// Import dinamico per non fallire in dev (il plugin espone sempre il modulo virtuale).
import { registerSW } from 'virtual:pwa-register';
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
