// public/service-worker.js

console.log("🟩 Service Worker Loaded");

// Listen for push events from backend
self.addEventListener("push", (event) => {
  console.log("🔥 PUSH EVENT RECEIVED:", event);

  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    console.error("❌ Error parsing push event data:", err);
  }

  const notificationTitle = data.title || "New Notification";
  const notificationOptions = {
    body: data.body || "You have a new update.",
    icon: "/w2.png",     // Make sure these icons exist in /public
    badge: "/dp.jpg",
    data: data,          // You can pass extra data for click handling
  };

  // Show the notification
  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});


// Handle notification click (very important for UX)
self.addEventListener("notificationclick", (event) => {
  console.log("📌 Notification clicked:", event.notification);

  event.notification.close();

  // Open or focus the app window
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If any client tab is already open, focus it
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      // If not open, open a new tab
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
