import { keyFor, json } from "./_utils.js";

export async function onRequestPost(context) {
    const { request, env } = context;

    let sub;
    try {
        sub = await request.json();
    } catch {
        return json({ error: "JSON inválido" }, 400);
    }

    if (!sub || !sub.endpoint || !sub.keys) {
        return json({ error: "subscrição inválida" }, 400);
    }

    const key = await keyFor(sub.endpoint);
    await env.SUBSCRIBERS.put(key, JSON.stringify({ ...sub, subscribedAt: Date.now() }));

    return json({ ok: true });
}