self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data;
  const target =
    (data && typeof data.url === 'string' && data.url) ||
    `${self.registration.scope}#log`;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        client.postMessage({ type: 'habits-navigate', url: target });
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(target);
      }
      return undefined;
    }),
  );
});
