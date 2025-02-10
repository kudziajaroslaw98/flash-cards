self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data?.title || 'Notification';
  const options = {
    body: data?.body || 'You have a new notification.',
    icon: data?.icon || '/icon-192x192.png',
    vibrate: [100, 50, 100],
    silent: false,
    requireInteraction: false,
    actions: data?.actions || [],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event?.notification.close();

  if (event.action === 'open') {
    event.waitUntil(self.clients.openWindow('/flashcards/learn'));
    return;
  }
  event?.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        if (clientList.length > 0) {
          let client = clientList[0];
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].focused) {
              client = clientList[i];
            }
          }
          return client.focus();
        }
        return self.clients.openWindow('/');
      }),
  );
});
