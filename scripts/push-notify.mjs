import webpush from "web-push";
import "dotenv/config";

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, PUSH_ENDPOINT, PUSH_ADMIN_SECRET } = process.env;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && VAPID_SUBJECT) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

async function fetchSubscribers() {
    const res = await fetch(`${PUSH_ENDPOINT}/subscribers`, {
        headers: { "X-Admin-Secret": PUSH_ADMIN_SECRET },
    });
    if (!res.ok) {
        throw new Error(`Não foi possível obter subscritores (status ${res.status})`);
    }
    return res.json();
}

async function removeExpiredSubscription(endpoint) {
    try {
        await fetch(`${PUSH_ENDPOINT}/unsubscribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint }),
        });
    } catch (err) {
        console.error("Falha ao remover subscrição expirada:", err.message);
    }
}

export async function notifyNewArticles(articles) {
    if (!articles || articles.length === 0) return;
    if (!VAPID_PRIVATE_KEY || !PUSH_ENDPOINT || !PUSH_ADMIN_SECRET) {
        console.warn("push-notify: variáveis de ambiente em falta — a saltar envio de notificações.");
        return;
    }

    let subscribers;
    try {
        subscribers = await fetchSubscribers();
    } catch (err) {
        console.error("push-notify:", err.message);
        return;
    }

    if (subscribers.length === 0) {
        console.log("push-notify: ainda não há subscritores.");
        return;
    }

    console.log(`push-notify: a notificar ${subscribers.length} subscritor(es) sobre ${articles.length} artigo(s) novo(s)...`);

    for (const article of articles) {
        const payload = JSON.stringify({
            title: "Novo artigo na Observação Clínica",
            body: article.title,
            url: article.url,
            icon: "/img/logo.webp",
            badge: "/icons/badge-72.png",
            image: article.image,
        });

        for (const sub of subscribers) {
            try {
                await webpush.sendNotification(sub, payload);
            } catch (err) {
                if (err.statusCode === 404 || err.statusCode === 410) {
                    await removeExpiredSubscription(sub.endpoint);
                } else {
                    console.error("push-notify: erro ao enviar push:", err.statusCode, err.message);
                }
            }
        }
    }

    console.log("push-notify: envio concluído.");
}