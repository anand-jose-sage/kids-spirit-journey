/// <reference lib="webworker" />

// Service Worker for Push Notifications — Shiloha PWA

const SW = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

SW.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || 'Shiloha';
  const options = {
    body: data.body || '',
    icon: '/images/logo.png',
    badge: '/images/logo.png',
    tag: data.tag || 'shiloha-notification',
    data: {
      url: data.url || '/dashboard',
    },
    vibrate: [100, 50, 100],
    actions: data.actions || [],
  };

  event.waitUntil(SW.registration.showNotification(title, options));
});

SW.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    SW.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(SW.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Otherwise open new window
      return SW.clients.openWindow(url);
    })
  );
});

// Basic install/activate — claim clients immediately
SW.addEventListener('install', () => SW.skipWaiting());
SW.addEventListener('activate', (event) => event.waitUntil(SW.clients.claim()));
