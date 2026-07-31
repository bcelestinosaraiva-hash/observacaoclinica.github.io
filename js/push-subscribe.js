// push-subscribe.js — inclui este script em todas as páginas do site (antes de </body>)
const VAPID_PUBLIC_KEY = "BB7shUEIi0oN1eM6uBR2hERuLjPokSqJuvZyktBAYnVdMxVEwdquEGWy5xO5Gayw0yBq1HzvAMQ2OdnpdzQT2bc";
const PUSH_ENDPOINT = ""; // vazio = mesmo domínio do site (Pages Functions)

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

function showSubscribePrompt(onAccept) {
  const bar = document.createElement("div");
  bar.id = "push-prompt";
  bar.innerHTML = `
    <span>Queres receber uma notificação quando publicarmos um novo artigo?</span>
    <button id="push-accept" type="button">Ativar</button>
    <button id="push-dismiss" type="button">Agora não</button>
  `;
  document.body.appendChild(bar);

  document.getElementById("push-accept").addEventListener("click", () => {
    onAccept();
    bar.remove();
  });
  document.getElementById("push-dismiss").addEventListener("click", () => {
    localStorage.setItem("push-dismissed", "1");
    bar.remove();
  });
}

async function initPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  if (localStorage.getItem("push-dismissed") === "1") return;
  if (Notification.permission === "denied") return;

  const registration = await navigator.serviceWorker.register("/sw.js");
  const existing = await registration.pushManager.getSubscription();
  if (existing) return;

  showSubscribePrompt(async () => {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      await fetch(`${PUSH_ENDPOINT}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
    } catch (err) {
      console.error("Falha ao subscrever notificações push:", err);
    }
  });
}

initPush();
