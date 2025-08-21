// Pinvoices Service Worker v1.0 (Beta)
// Developer: Anas Lila | Published By: AL Software
// Last Updated: 21/Aug/2025 3:49:00 PM IST

const CACHE_NAME = 'pinvoices-v1.0.0';
const STATIC_CACHE = 'pinvoices-static-v1.0.0';
const DYNAMIC_CACHE = 'pinvoices-dynamic-v1.0.0';
const DATA_CACHE = 'pinvoices-data-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/premium-users.json',
  '/users-data.json',
  'https://i.postimg.cc/7636654Z/Untitled-design.png', // Logo
  // Fonts and external resources
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/users',
  '/api/invoices',
  '/api/customers',
  '/api/products',
  '/premium-users.json',
  '/users-data.json'
];

// Install event - Cache static files
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[ServiceWorker] Caching static files');
        return cache.addAll(STATIC_FILES);
      }),
      
      // Cache API endpoints
      caches.open(DATA_CACHE).then((cache) => {
        console.log('[ServiceWorker] Caching data files');
        return cache.addAll(API_ENDPOINTS.filter(url => url.includes('.json')));
      })
    ]).then(() => {
      console.log('[ServiceWorker] Installation complete');
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== DATA_CACHE &&
                cacheName !== CACHE_NAME) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('[ServiceWorker] Activation complete');
    })
  );
});

// Fetch event - Serve cached content when offline
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Handle different types of requests
  if (event.request.method === 'GET') {
    // Handle static files
    if (isStaticFile(event.request.url)) {
      event.respondWith(handleStaticFile(event.request));
    }
    // Handle data files (JSON)
    else if (isDataFile(event.request.url)) {
      event.respondWith(handleDataFile(event.request));
    }
    // Handle external resources
    else if (isExternalResource(event.request.url)) {
      event.respondWith(handleExternalResource(event.request));
    }
    // Handle navigation requests
    else if (event.request.mode === 'navigate') {
      event.respondWith(handleNavigation(event.request));
    }
    // Handle other requests
    else {
      event.respondWith(handleOtherRequests(event.request));
    }
  }
  
  // Handle POST requests (form submissions, data saves)
  else if (event.request.method === 'POST') {
    event.respondWith(handlePostRequest(event.request));
  }
});

// Handle static files (Cache First strategy)
async function handleStaticFile(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Static file fetch failed:', error);
    // Return offline page if available
    return caches.match('/index.html');
  }
}

// Handle data files (Network First strategy)
async function handleDataFile(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DATA_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[ServiceWorker] Data file network fetch failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return default data structure if no cache available
    return new Response(JSON.stringify(getDefaultData(request.url)), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle external resources (Cache First strategy)
async function handleExternalResource(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] External resource fetch failed:', error);
    return new Response('', { status: 408, statusText: 'Request Timeout' });
  }
}

// Handle navigation requests
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Navigation fetch failed, serving cached index.html:', error);
    return caches.match('/index.html');
  }
}

// Handle other requests (Network First strategy)
async function handleOtherRequests(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Handle POST requests (for data synchronization)
async function handlePostRequest(request) {
  try {
    // Try to send the request
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] POST request failed, storing for sync:', error);
    
    // Store request for background sync
    const requestData = {
      url: request.url,
      method: request.method,
      headers: [...request.headers.entries()],
      body: await request.text(),
      timestamp: Date.now()
    };
    
    // Store in IndexedDB for later sync
    await storeFailedRequest(requestData);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Request stored for sync when online',
      stored: true 
    }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync triggered:', event.tag);
  
  if (event.tag === 'pinvoices-data-sync') {
    event.waitUntil(syncFailedRequests());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Pinvoices',
    icon: 'https://i.postimg.cc/7636654Z/Untitled-design.png',
    badge: 'https://i.postimg.cc/7636654Z/Untitled-design.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Open Pinvoices',
        icon: 'https://i.postimg.cc/7636654Z/Untitled-design.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: 'https://i.postimg.cc/7636654Z/Untitled-design.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Pinvoices', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'GET_VERSION':
        event.ports[0].postMessage({
          version: '1.0.0',
          cache: CACHE_NAME
        });
        break;
      case 'CLEAR_CACHE':
        clearAllCaches().then(() => {
          event.ports[0].postMessage({ success: true });
        });
        break;
      case 'SYNC_DATA':
        syncFailedRequests().then(() => {
          event.ports[0].postMessage({ synced: true });
        });
        break;
    }
  }
});

// Utility functions
function isStaticFile(url) {
  return STATIC_FILES.some(file => url.includes(file)) || 
         url.endsWith('.css') || 
         url.endsWith('.js') || 
         url.endsWith('.html');
}

function isDataFile(url) {
  return url.includes('.json') || 
         API_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

function isExternalResource(url) {
  return url.includes('googleapis.com') || 
         url.includes('postimg.cc') ||
         url.includes('fonts.gstatic.com') ||
         !url.includes(self.location.origin);
}

function getDefaultData(url) {
  if (url.includes('premium-users.json')) {
    return {
      premiumUsers: [],
      metadata: {
        version: "1.0",
        lastUpdated: new Date().toLocaleDateString('en-IN'),
        totalPremiumUsers: 0
      }
    };
  }
  
  if (url.includes('users-data.json')) {
    return {
      version: "1.0",
      lastUpdated: new Date().toLocaleDateString('en-IN'),
      users: {},
      globalSettings: {
        invoiceCounter: { INV: 0, PROF: 0, PROP: 0 },
        taxRates: { gst: 18, cgst: 9, sgst: 9 }
      }
    };
  }
  
  return { error: 'No default data available' };
}

// IndexedDB operations for offline data storage
async function storeFailedRequest(requestData) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PinvoicesDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['failedRequests'], 'readwrite');
      const store = transaction.objectStore('failedRequests');
      store.add(requestData);
      transaction.oncomplete = () => resolve();
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('failedRequests')) {
        const store = db.createObjectStore('failedRequests', { keyPath: 'timestamp' });
        store.createIndex('url', 'url', { unique: false });
      }
    };
  });
}

async function syncFailedRequests() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PinvoicesDB', 1);
    
    request.onsuccess = async () => {
      const db = request.result;
      const transaction = db.transaction(['failedRequests'], 'readwrite');
      const store = transaction.objectStore('failedRequests');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = async () => {
        const failedRequests = getAllRequest.result;
        console.log('[ServiceWorker] Syncing', failedRequests.length, 'failed requests');
        
        for (const requestData of failedRequests) {
          try {
            await fetch(requestData.url, {
              method: requestData.method,
              headers: new Headers(requestData.headers),
              body: requestData.body
            });
            
            // Remove successfully synced request
            store.delete(requestData.timestamp);
            console.log('[ServiceWorker] Successfully synced request to', requestData.url);
          } catch (error) {
            console.log('[ServiceWorker] Failed to sync request to', requestData.url, error);
          }
        }
        
        resolve();
      };
    };
  });
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('[ServiceWorker] All caches cleared');
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'pinvoices-backup') {
    event.waitUntil(performBackgroundBackup());
  }
});

async function performBackgroundBackup() {
  console.log('[ServiceWorker] Performing background backup');
  // Implement backup logic here
  // This could sync local data to a remote server
}

// Handle app updates
self.addEventListener('appinstalled', (event) => {
  console.log('[ServiceWorker] Pinvoices app installed successfully');
  
  // Track installation
  self.registration.showNotification('Pinvoices Installed!', {
    body: 'You can now use Pinvoices offline and access it from your home screen.',
    icon: 'https://i.postimg.cc/7636654Z/Untitled-design.png',
    badge: 'https://i.postimg.cc/7636654Z/Untitled-design.png'
  });
});

// Performance monitoring
self.addEventListener('fetch', (event) => {
  // Track performance metrics
  const startTime = Date.now();
  
  event.respondWith(
    handleRequest(event.request).then(response => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Log slow requests
      if (duration > 5000) {
        console.warn('[ServiceWorker] Slow request detected:', event.request.url, duration + 'ms');
      }
      
      return response;
    })
  );
});

async function handleRequest(request) {
  // This is a wrapper for all request handling
  if (request.method === 'GET') {
    if (isStaticFile(request.url)) {
      return handleStaticFile(request);
    } else if (isDataFile(request.url)) {
      return handleDataFile(request);
    } else if (isExternalResource(request.url)) {
      return handleExternalResource(request);
    } else if (request.mode === 'navigate') {
      return handleNavigation(request);
    } else {
      return handleOtherRequests(request);
    }
  } else if (request.method === 'POST') {
    return handlePostRequest(request);
  } else {
    return fetch(request);
  }
}

console.log('[ServiceWorker] Service Worker script loaded successfully');
