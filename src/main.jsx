import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register';

// Import PWA test utilities in development
if (import.meta.env.DEV) {
  import('./sw-test.js').then(({ runPWATests }) => {
    window.runPWATests = runPWATests;
    console.log('PWA Test Utils available. Run window.runPWATests() to check PWA status.');
  });
}

// Debug function to check PWA installability
window.checkPWAInstallability = () => {
  console.log('PWA Installability Check:');
  console.log('- iOS standalone:', navigator.standalone);
  console.log('- Display-mode standalone:', window.matchMedia('(display-mode: standalone)').matches);
  console.log('- Service worker support:', 'serviceWorker' in navigator);
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      console.log('- Service worker registrations:', registrations.length);
    });
  }
  
  // Check if manifest exists
  const manifestLink = document.querySelector('link[rel="manifest"]');
  console.log('- Manifest link exists:', !!manifestLink);
  if (manifestLink) {
    console.log('- Manifest href:', manifestLink.href);
  }
};

// Make this function available to the browser console
if (import.meta.env.DEV) {
  window.checkPWAInstallability = window.checkPWAInstallability;
}

if ('serviceWorker' in navigator) {
  // Register service worker
  const updateSW = registerSW({
    onNeedRefresh() {
      console.log('New content available, click on reload button to update.');
    },
    onOfflineReady() {
      console.log('App ready to work offline');
    },
  });
  
  // Make updateSW available globally for debugging
  window.updateSW = updateSW;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
