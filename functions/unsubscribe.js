import { keyFor, json } from "./_utils.js";

export async function onRequestPost(context) {
    const { request, env } = context;

    let body;
    try {
        body = await request.json();
    } catch {
        return json({ error: "JSON inválido" }, 400);
    }

    if (!body || !body.endpoint) {
        return json({ error: "endpoint em falta" }, 400);
    }

    const key = await keyFor(body.endpoint);
    await env.SUBSCRIBERS.delete(key);

    return json({ ok: true });
}