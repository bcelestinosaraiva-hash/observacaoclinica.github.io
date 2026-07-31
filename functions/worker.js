// worker.js — Worker de subscrições de push para observacaoclinica.com
//
// Rotas:
//   POST   /subscribe    -> guarda uma subscrição (chamado pelo browser do visitante)
//   POST   /unsubscribe  -> remove uma subscrição (endpoint no body)
//   GET    /subscribers  -> devolve todas as subscrições (protegido por X-Admin-Secret)

const ALLOWED_ORIGINS = [
  "https://observacaoclinica.com",
  "https://www.observacaoclinica.com",
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Secret",
  };
}

async function keyFor(endpoint) {
  const enc = new TextEncoder().encode(endpoint);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function json(data, status, extraHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    // Guarda uma nova subscrição
    if (url.pathname === "/subscribe" && request.method === "POST") {
      let sub;
      try {
        sub = await request.json();
      } catch {
        return json({ error: "JSON inválido" }, 400, headers);
      }
      if (!sub || !sub.endpoint || !sub.keys) {
        return json({ error: "subscrição inválida" }, 400, headers);
      }
      const key = await keyFor(sub.endpoint);
      await env.SUBSCRIBERS.put(key, JSON.stringify({ ...sub, subscribedAt: Date.now() }));
      return json({ ok: true }, 200, headers);
    }

    // Remove uma subscrição (usado ao dar unsubscribe, ou quando um push falha com 404/410)
    if (url.pathname === "/unsubscribe" && (request.method === "POST" || request.method === "DELETE")) {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "JSON inválido" }, 400, headers);
      }
      if (!body || !body.endpoint) {
        return json({ error: "endpoint em falta" }, 400, headers);
      }
      const key = await keyFor(body.endpoint);
      await env.SUBSCRIBERS.delete(key);
      return json({ ok: true }, 200, headers);
    }

    // Lista todas as subscrições — só para o script de envio (Node), protegido por segredo
    if (url.pathname === "/subscribers" && request.method === "GET") {
      const secret = request.headers.get("X-Admin-Secret");
      if (!secret || secret !== env.ADMIN_SECRET) {
        return json({ error: "não autorizado" }, 401, headers);
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
      return json(subs, 200, headers);
    }

    return json({ error: "not found" }, 404, headers);
  },
};
