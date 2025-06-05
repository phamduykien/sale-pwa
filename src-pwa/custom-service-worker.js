import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Precache all assets defined in the Workbox manifest (injected by Quasar)
precacheAndRoute(self.__WB_MANIFEST);

// Example runtime caching for API calls (can be customized)
registerRoute(
  ({ url }) => url.href.startsWith('https://ubuntu.cukcuk.store:8443/g4/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// Example runtime caching for images (can be customized)
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

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
