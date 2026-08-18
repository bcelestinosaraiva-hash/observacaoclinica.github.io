self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Novo artigo", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Observação Clínica";
  const options = {
    body: data.body || "Novo artigo.",
    icon: data.icon || "/favicon/observacao.svg",        // logo a cores, aparece dentro da notificação
    badge: data.badge || "/favicon/observacao.svg", // silhueta branca, aparece na barra de estado (Android) — tem de ser um ficheiro à parte
    image: data.image || undefined,             // imagem do artigo, aparece em destaque
    tag: data.url || "observacao-clinica-artigo", // evita empilhar notificações repetidas do mesmo artigo
    renotify: true,
    requireInteraction: false,
    vibrate: [100, 50, 100],
    dir: "ltr",
    lang: "pt",
    data: { url: data.url || "/" },
    actions: [{ action: "open", title: "Ler agora" }],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data && event.notification.data.url ? event.notification.data.url : "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});