import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Use this for production urls that need to be absolute
// e.g. email verification links, password reset links, etc.
const appConfig = {
  // Default to window.location.origin, but can be overridden by env var
  appDomain: import.meta.env.VITE_APP_DOMAIN || window.location.origin,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Determine if we're in production based on hostname
const isProduction = typeof window !== 'undefined' && 
  !window.location.hostname.includes('localhost') && 
  !window.location.hostname.includes('127.0.0.1');

// Initialize Analytics only in production environment or if explicitly enabled
const analyticsEnabled = isProduction || import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
const analytics = typeof window !== 'undefined' && analyticsEnabled ? getAnalytics(app) : null;

// Helper function to log events only when analytics is enabled
const logAnalyticsEvent = (eventName, eventParams = {}) => {
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  }
};

export { app, auth, db, analytics, logAnalyticsEvent, appConfig };