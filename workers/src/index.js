/**
 * ============================================
 * Worker — API de comentários (observacaoclinica.com)
 * ============================================
 *
 * Rotas:
 *   POST /api/auth/google        -> valida um id_token do Google
 *   GET  /api/comments?slug=..   -> lista comentários APROVADOS de um artigo
 *   POST /api/comments           -> cria um comentário (fica "pending")
 *
 *   GET  /api/admin/comments?status=pending   -> lista p/ moderação (requer admin)
 *   POST /api/admin/comments/:id/approve      -> aprova (requer admin)
 *   POST /api/admin/comments/:id/reject       -> rejeita (requer admin)
 *
 * Autenticação admin: header  Authorization: Bearer <ADMIN_TOKEN>
 * (ADMIN_TOKEN é um secret configurado via `wrangler secret put ADMIN_TOKEN`)
 */

const MAX_TEXTO_LEN = 2000;
const MIN_SECONDS_BETWEEN_COMMENTS = 30; // anti-spam simples por usuário

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // troque pelo seu domínio em produção
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

function badRequest(msg) {
  return json({ error: msg }, 400);
}

function unauthorized(msg = "Não autorizado") {
  return json({ error: msg }, 401);
}

// ------------------------------------------------------------------
// Valida o id_token do Google chamando o endpoint público tokeninfo.
// Isso confere a assinatura, expiração e o "aud" (client_id) —
// não precisa da chave secreta do OAuth para isso.
// ------------------------------------------------------------------
async function verifyGoogleIdToken(idToken, expectedClientId) {
  if (!idToken) return null;

  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  );
  if (!res.ok) return null;

  const payload = await res.json();

  if (payload.aud !== expectedClientId) return null;
  if (!payload.sub || !payload.email) return null;

  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name || payload.email,
    picture: payload.picture || "",
    emailVerified: payload.email_verified === "true" || payload.email_verified === true,
  };
}

async function verifyTurnstile(token, secretKey, ip) {
  // Se você ainda não configurou o Turnstile de verdade, deixe
  // TURNSTILE_SECRET_KEY sem definir — a verificação é pulada.
  if (!secretKey) return true;
  if (!token) return false;

  const form = new FormData();
  form.append("secret", secretKey);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: form }
    );
    const data = await res.json();
    return !!data.success;
  } catch {
    return false;
  }
}

function requireAdmin(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  return env.ADMIN_TOKEN && token === env.ADMIN_TOKEN;
}

// ------------------------------------------------------------------
// Handlers
// ------------------------------------------------------------------

async function handleAuthGoogle(request, env) {
  const body = await request.json().catch(() => null);
  if (!body?.id_token) return badRequest("id_token é obrigatório");

  const user = await verifyGoogleIdToken(body.id_token, env.GOOGLE_CLIENT_ID);
  if (!user) return unauthorized("Token inválido");

  return json({ ok: true, name: user.name, email: user.email, picture: user.picture });
}

async function handleListComments(request, env) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return badRequest("slug é obrigatório");

  const { results } = await env.DB.prepare(
    `SELECT id, name, picture, texto, created_at as createdAt
     FROM comments
     WHERE slug = ? AND status = 'approved'
     ORDER BY created_at DESC
     LIMIT 200`
  )
    .bind(slug)
    .all();

  return json({ comments: results });
}

async function handlePostComment(request, env) {
  const body = await request.json().catch(() => null);
  if (!body) return badRequest("Corpo inválido");

  const { id_token, slug, texto, turnstileToken } = body;

  if (!slug) return badRequest("slug é obrigatório");
  if (!texto || !texto.trim()) return badRequest("Comentário vazio");
  if (texto.length > MAX_TEXTO_LEN) {
    return badRequest(`Comentário muito longo (máx. ${MAX_TEXTO_LEN} caracteres)`);
  }

  const user = await verifyGoogleIdToken(id_token, env.GOOGLE_CLIENT_ID);
  if (!user) return unauthorized("Faça login novamente para comentar");

  const turnstileOk = await verifyTurnstile(
    turnstileToken,
    env.TURNSTILE_SECRET_KEY,
    request.headers.get("CF-Connecting-IP")
  );
  if (!turnstileOk) return badRequest("Falha na verificação anti-spam. Tente novamente.");

  // anti-spam simples: bloqueia comentários muito seguidos do mesmo usuário
  const recent = await env.DB.prepare(
    `SELECT created_at FROM comments
     WHERE google_sub = ?
     ORDER BY created_at DESC
     LIMIT 1`
  )
    .bind(user.sub)
    .first();

  if (recent) {
    const last = new Date(recent.created_at + "Z").getTime();
    const secondsSince = (Date.now() - last) / 1000;
    if (secondsSince < MIN_SECONDS_BETWEEN_COMMENTS) {
      return json(
        { error: "Aguarde um pouco antes de enviar outro comentário." },
        429
      );
    }
  }

  await env.DB.prepare(
    `INSERT INTO comments (slug, google_sub, name, email, picture, texto, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`
  )
    .bind(slug, user.sub, user.name, user.email, user.picture, texto.trim())
    .run();

  return json({ ok: true, status: "pending" }, 201);
}

async function handleAdminList(request, env) {
  if (!requireAdmin(request, env)) return unauthorized();

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "pending";

  const { results } = await env.DB.prepare(
    `SELECT id, slug, name, email, picture, texto, status, created_at as createdAt
     FROM comments
     WHERE status = ?
     ORDER BY created_at DESC
     LIMIT 200`
  )
    .bind(status)
    .all();

  return json({ comments: results });
}

async function handleAdminModerate(request, env, id, action) {
  if (!requireAdmin(request, env)) return unauthorized();
  if (!["approve", "reject"].includes(action)) return badRequest("Ação inválida");

  const newStatus = action === "approve" ? "approved" : "rejected";

  await env.DB.prepare(
    `UPDATE comments SET status = ?, updated_at = datetime('now') WHERE id = ?`
  )
    .bind(newStatus, id)
    .run();

  return json({ ok: true, id: Number(id), status: newStatus });
}

// ------------------------------------------------------------------
// Router
// ------------------------------------------------------------------

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    if (method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      if (pathname === "/api/auth/google" && method === "POST") {
        return await handleAuthGoogle(request, env);
      }

      if (pathname === "/api/comments" && method === "GET") {
        return await handleListComments(request, env);
      }

      if (pathname === "/api/comments" && method === "POST") {
        return await handlePostComment(request, env);
      }

      if (pathname === "/api/admin/comments" && method === "GET") {
        return await handleAdminList(request, env);
      }

      const modMatch = pathname.match(/^\/api\/admin\/comments\/(\d+)\/(approve|reject)$/);
      if (modMatch && method === "POST") {
        const [, id, action] = modMatch;
        return await handleAdminModerate(request, env, id, action);
      }

      return json({ error: "Rota não encontrada" }, 404);
    } catch (err) {
      console.error(err);
      return json({ error: "Erro interno" }, 500);
    }
  },
};
