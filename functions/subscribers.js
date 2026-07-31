import { json } from "./_utils.js";

export async function onRequestGet(context) {
    const { request, env } = context;

    const secret = request.headers.get("X-Admin-Secret");
    if (!secret || secret !== env.ADMIN_SECRET) {
        return json({ error: "não autorizado" }, 401);
    }

    const subs = [];
    let cursor;
    do {
        const list = await env.SUBSCRIBERS.list({ cursor });
        for (const k of list.keys) {
            const value = await env.SUBSCRIBERS.get(k.name);
            if (value) subs.push(JSON.parse(value));
        }
        cursor = list.list_complete ? undefined : list.cursor;
    } while (cursor);

    return json(subs);
}