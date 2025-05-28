/**
 * This file is for testing service worker functionality manually.
 * You can copy and paste this code into the browser console to check 
 * if the service worker is registered and working correctly.
 */

// Check if service worker is registered
async function checkServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log('Service Worker Registrations:', registrations);
    
    if (registrations.length === 0) {
      console.log('❌ No Service Worker registered');
    } else {
      console.log('✅ Service Worker is registered');
      registrations.forEach(reg => {
        console.log('Service Worker:', reg);
        console.log('Service Worker State:', reg.active ? reg.active.state : 'No active worker');
      });
    }
  } else {
    console.log('❌ Service Workers not supported in this browser');
  }
}

// Check caches
async function checkCaches() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    console.log('Cache Names:', cacheNames);
    
    if (cacheNames.length === 0) {
      console.log('❌ No caches found');
    } else {
      console.log('✅ Caches found');
      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        console.log(`Cache '${name}' contains ${keys.length} items:`);
        if (keys.length > 0) {
          console.log('Sample cached items:');
          console.log(keys.slice(0, 5));
        }
      }
    }
  } else {
    console.log('❌ Cache API not supported in this browser');
  }
}

// Test offline capability
async function testOfflineCapability() {
  console.log('🔍 Testing offline capability...');
  console.log('To fully test, disable network in DevTools and reload the page');
  
  // Basic fetch test
  try {
    const response = await fetch('/');
    console.log('Fetch response status:', response.status);
    if (response.status === 200) {
      console.log('✅ Fetch successful');
    } else {
      console.log('❌ Fetch failed with status:', response.status);
    }
  } catch (error) {
    console.log('❌ Fetch failed with error:', error);
  }
}

// Run tests
async function runPWATests() {
  console.log('🧪 Running PWA Tests');
  console.log('--------------------');
  
  await checkServiceWorker();
  console.log('--------------------');
  
  await checkCaches();
  console.log('--------------------');
  
  await testOfflineCapability();
  console.log('--------------------');
  
  console.log('PWA installation status:');
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('✅ App is installed and running in standalone mode');
  } else {
    console.log('❌ App is running in browser (not installed as PWA)');
  }
}

// Uncomment the line below to run the tests
// runPWATests();

export { runPWATests }; 