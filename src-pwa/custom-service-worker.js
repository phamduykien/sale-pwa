import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing'; // Xóa NavigationRoute
import { StaleWhileRevalidate, NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Precache all assets defined in the Workbox manifest (injected by Quasar)
precacheAndRoute(self.__WB_MANIFEST);

// Cache các file font và styles
registerRoute(
  ({ request }) => request.destination === 'font' || request.destination === 'style',
  new CacheFirst({
    cacheName: 'static-resources',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// API calls caching với background sync
const bgSyncPlugin = new BackgroundSyncPlugin('api-queue', {
  maxRetentionTime: 24 * 60, // 24 hours (in minutes)
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request.clone());
        console.log('Sync success for:', entry.request.url);
      } catch (error) {
        console.error('Sync failed for:', entry.request.url, error);
        throw error;
      }
    }
  }
});

// Cache API calls với network first strategy và background sync
registerRoute(
  ({ url }) => url.href.startsWith('https://ubuntu.cukcuk.store:8443/g4/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      bgSyncPlugin,
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 Days
      }),
    ],
  })
);

// Cache images với stale-while-revalidate strategy
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'image-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// Cache all navigation requests (HTML pages)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
      })
    ]
  })
);

// Handle offline fallback - Bỏ đoạn này để NetworkFirst cho navigation requests hoạt động
// self.addEventListener('fetch', (event) => {
//   if (event.request.mode === 'navigate') {
//     event.respondWith(
//       fetch(event.request).catch(() => {
//         // Thay vì trả về /offline.html, NetworkFirst sẽ cố gắng lấy từ cache
//         // trang đã được cache (thường là index.html của SPA)
//         return caches.match(event.request); // Hoặc một trang SPA gốc cụ thể nếu cần
//       })
//     );
//   }
// });

// Push Notification Event Listener
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  let notificationData = {};
  try {
    notificationData = event.data.json();
  } catch (e) {
    console.error('Error parsing push notification data:', e);
    notificationData = {
      title: 'Thông báo mới',
      body: event.data.text() || 'Bạn có một thông báo mới.',
      icon: '/icons/favicon-128x128.png', // Path to an icon
      badge: '/icons/favicon-96x96.png' // Path to a badge icon
    };
  }

  const title = notificationData.title || 'Thông báo mới';
  const options = {
    body: notificationData.body || 'Bạn có một thông báo mới.',
    icon: notificationData.icon || '/icons/favicon-128x128.png',
    badge: notificationData.badge || '/icons/favicon-96x96.png',
    vibrate: [200, 100, 200], // Vibration pattern
    data: notificationData.data || { url: '/' } // Custom data to send to notification click handler
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification Click Event Listener
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close(); // Close the notification

  // Open the app or a specific URL
  const urlToOpen = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Optional: Listen for activate event to claim clients immediately
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  event.waitUntil(clients.claim());
});

// Optional: Listen for install event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  // Perform install steps, like skipWaiting
  event.waitUntil(self.skipWaiting());
});
