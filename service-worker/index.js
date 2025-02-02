self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data?.title || 'Notification';
  const options = {
    body: data?.body || 'You have a new notification.',
    icon: data?.icon || '/icon.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event?.notification.close();
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
