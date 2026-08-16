// Service worker mínimo: solo existe para recibir notificaciones push y abrir la app al tocarlas.
// No cachea nada (no es un service worker de "modo offline") — a propósito, para no complicar
// actualizaciones de la app con caché viejo.

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let datos;
  try {
    datos = event.data.json();
  } catch {
    datos = { titulo: "EVA 40+", cuerpo: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(datos.titulo || "EVA 40+", {
      body: datos.cuerpo || "",
      icon: "/brand/icon.png",
      badge: "/brand/icon.png",
      data: { url: datos.url || "/app" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/app";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
