// Service worker: riceve le notifiche push e aggiorna il badge dell'icona
// (iOS 16.4+ supporta sia Web Push sia Badging API per i PWA installati
// tramite "Aggiungi a Home").

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "BnB Stock";
  const options = {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: data.url || "/" },
  };

  event.waitUntil(
    (async () => {
      if (typeof data.badge === "number" && "setAppBadge" in self.navigator) {
        try {
          await self.navigator.setAppBadge(data.badge);
        } catch (e) {
          /* badge non supportato: si ignora */
        }
      }
      await self.registration.showNotification(title, options);
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(self.clients.openWindow(url));
});
