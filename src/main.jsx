import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/custom.css'; // Hier kannst du später benutzerdefiniertes CSS hinzufügen
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registriert:', registration);
      })
      .catch((error) => {
        console.error('Service Worker Registrierung fehlgeschlagen:', error);
      });
  });
}
