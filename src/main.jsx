import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Import PWA test utilities in development
if (import.meta.env.DEV) {
  import('./sw-test.js').then(({ runPWATests }) => {
    window.runPWATests = runPWATests;
    console.log('PWA Test Utils available. Run window.runPWATests() to check PWA status.');
  });
}

// Register the fallback service worker if needed
const registerFallbackServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    // Check if vite-plugin-pwa registered a service worker
    navigator.serviceWorker.getRegistrations().then(registrations => {
      if (registrations.length === 0) {
        // No service worker, register our fallback
        console.log('No service worker found, registering fallback...');
        navigator.serviceWorker.register('/sw.js')
          .then(reg => {
            console.log('Fallback Service worker registered successfully:', reg.scope);
          })
          .catch(error => {
            console.log('Fallback Service worker registration failed:', error);
          });
      } else {
        console.log('Service worker already registered:', registrations);
      }
    });
  }
};

// Wait for the window to load before checking service worker
window.addEventListener('load', () => {
  // Wait a bit to allow vite-plugin-pwa to register its service worker first
  setTimeout(registerFallbackServiceWorker, 1000);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
