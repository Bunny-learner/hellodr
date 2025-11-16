// public/service-worker.js

console.log("Service Worker Loaded.");

// This event fires when a push message is received
self.addEventListener('push', (event) => {

  const data = event.data.json(); // Get the payload { title, body }

  const title = data.title || "New Notification";
  const options = {
    body: data.body,
    icon: '/icon-192.png', // Make sure you have an icon with this name in /public
    badge: '/badge.png',   // (Optional) A smaller badge for Android
  };

  // This is the line that actually shows the notification
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});