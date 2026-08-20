/* ============================================ */
/* comentarios.js — login Google + comentários   */
/* ============================================ */

(function () {
    "use strict";

    // ------------------------------------------------------------------
    // CONFIGURAÇÃO
    // ------------------------------------------------------------------
    // ID do cliente OAuth (público — pode ficar no frontend sem problema).
    const GOOGLE_CLIENT_ID =
        "107435859530-jacvqe4iubpt3qq23pto7mrs0sb2sngs.apps.googleusercontent.com";

    // Endpoints do seu Worker (ajuste os caminhos conforme o que você criar).
    const API_BASE = "https://observacaoclinica-comentarios.bcelestinosaraiva.workers.dev/api"; // ex: https://observacaoclinica.com/api
    const ENDPOINT_VERIFY_LOGIN = `${API_BASE}/auth/google`; // POST { id_token }
    const ENDPOINT_LIST_COMMENTS = `${API_BASE}/comments`; // GET  ?slug=...
    const ENDPOINT_POST_COMMENT = `${API_BASE}/comments`; // POST { texto, slug, turnstileToken }

    // Identificador único do artigo atual (ajuste como preferir: slug, id, etc.)
    const ARTICLE_SLUG =
        document.querySelector('meta[name="article-slug"]')?.content ||
        location.pathname;

    const SESSION_KEY = "oc_comment_session"; // sessionStorage

    // ------------------------------------------------------------------
    // ELEMENTOS
    // ------------------------------------------------------------------
    const els = {
        loggedOut: document.getElementById("authLoggedOut"),
        loggedIn: document.getElementById("authLoggedIn"),
        btnLogin: document.getElementById("btnGoogleLogin"),
        btnLogout: document.getElementById("btnLogout"),
        userPicture: document.getElementById("userPicture"),
        userName: document.getElementById("userName"),
        userEmail: document.getElementById("userEmail"),
        form: document.getElementById("commentForm"),
        textarea: document.getElementById("c-texto"),
        commentCount: document.getElementById("commentCount"),
        commentList: document.getElementById("commentList"),
    };

    let currentSession = null; // { idToken, name, email, picture }

    // ------------------------------------------------------------------
    // UTIL — decodifica o payload de um JWT (só para exibir nome/foto
    // no cliente; a validação de verdade acontece no backend).
    // ------------------------------------------------------------------
    function decodeJwtPayload(token) {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const json = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
                    .join("")
            );
            return JSON.parse(json);
        } catch (e) {
            console.error("Falha ao decodificar token:", e);
            return null;
        }
    }

    function escapeHtml(str) {
        const d = document.createElement("div");
        d.textContent = str;
        return d.innerHTML;
    }

    function formatDate(iso) {
        try {
            return new Date(iso).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch {
            return "";
        }
    }

    // ------------------------------------------------------------------
    // SESSÃO
    // ------------------------------------------------------------------
    function saveSession(session) {
        currentSession = session;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        renderAuthState();
    }

    function clearSession() {
        currentSession = null;
        sessionStorage.removeItem(SESSION_KEY);
        renderAuthState();
    }

    function loadSession() {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    function renderAuthState() {
        const logged = !!currentSession;

        els.loggedOut.style.display = logged ? "none" : "flex";
        els.loggedIn.style.display = logged ? "flex" : "none";
        els.form.classList.toggle("is-locked", !logged);
        els.textarea.disabled = !logged;

        if (logged) {
            els.userPicture.src = currentSession.picture || "";
            els.userName.textContent = currentSession.name || "—";
            els.userEmail.textContent = currentSession.email || "—";
        }
    }

    // ------------------------------------------------------------------
    // LOGIN COM GOOGLE (Google Identity Services)
    // ------------------------------------------------------------------
    function initGoogleSignIn() {
        if (!window.google || !google.accounts || !google.accounts.id) {
            // O script do GSI ainda não carregou — tenta de novo em breve.
            setTimeout(initGoogleSignIn, 200);
            return;
        }

        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            ux_mode: "popup",
        });
    }

    async function handleCredentialResponse(response) {
        const idToken = response.credential;
        const payload = decodeJwtPayload(idToken);

        if (!payload) {
            showFeedback("Não foi possível ler os dados do login. Tente novamente.", "error");
            return;
        }

        // Exibe os dados imediatamente (UX otimista)...
        saveSession({
            idToken,
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
        });

        // ...e valida o token no backend, que é quem decide se a sessão
        // realmente vale (o backend verifica a assinatura do token com a
        // chave pública do Google — não precisa da chave secreta para isso).
        try {
            const res = await fetch(ENDPOINT_VERIFY_LOGIN, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_token: idToken }),
            });
            if (!res.ok) throw new Error("Verificação falhou");
        } catch (e) {
            console.error("Erro ao verificar login no servidor:", e);
            // Não desloga automaticamente aqui — cada envio de comentário vai
            // reenviar o id_token, então o backend recusa na hora de publicar
            // se o token for inválido.
        }
    }

    function triggerGoogleLogin() {
        if (!window.google || !google.accounts || !google.accounts.id) {
            showFeedback("O login do Google ainda está carregando, tente em instantes.", "error");
            return;
        }
        google.accounts.id.prompt((notification) => {
            // Fallback: se o One Tap não aparecer (bloqueado, já dispensado
            // antes, etc.), renderiza o botão oficial do Google como alternativa.
            if (
                notification.isNotDisplayed?.() ||
                notification.isSkippedMoment?.()
            ) {
                renderFallbackButton();
            }
        });
    }

    function renderFallbackButton() {
        let mount = document.getElementById("gsiFallbackMount");
        if (!mount) {
            mount = document.createElement("div");
            mount.id = "gsiFallbackMount";
            mount.style.marginTop = "10px";
            els.loggedOut.appendChild(mount);
        }
        mount.innerHTML = "";
        google.accounts.id.renderButton(mount, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "signin_with",
            locale: "pt-BR",
        });
    }

    function logout() {
        if (window.google?.accounts?.id) {
            google.accounts.id.disableAutoSelect();
        }
        clearSession();
    }

    // ------------------------------------------------------------------
    // FEEDBACK visual no formulário
    // ------------------------------------------------------------------
    function showFeedback(msg, type) {
        let box = document.getElementById("commentFeedback");
        if (!box) {
            box = document.createElement("div");
            box.id = "commentFeedback";
            box.className = "comment-feedback";
            els.form.appendChild(box);
        }
        box.textContent = msg;
        box.className = `comment-feedback show ${type}`;
        setTimeout(() => box.classList.remove("show"), 5000);
    }

    // ------------------------------------------------------------------
    // ENVIO DE COMENTÁRIO
    // ------------------------------------------------------------------
    async function handleSubmit(evt) {
        evt.preventDefault();

        if (!currentSession) {
            showFeedback("Entre com sua conta Google para comentar.", "error");
            return;
        }

        const texto = els.textarea.value.trim();
        if (!texto) return;

        const submitBtn = els.form.querySelector(".submit");
        submitBtn.disabled = true;
        submitBtn.textContent = "Enviando…";

        try {
            // O Turnstile real deve ser inicializado no elemento
            // #turnstile-container (script da Cloudflare) e o token
            // resultante lido aqui antes do envio.
            const turnstileToken =
                document.querySelector('[name="cf-turnstile-response"]')?.value || null;

            const res = await fetch(ENDPOINT_POST_COMMENT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_token: currentSession.idToken,
                    slug: ARTICLE_SLUG,
                    texto,
                    turnstileToken,
                }),
            });

            if (!res.ok) throw new Error("Falha ao enviar comentário");

            els.textarea.value = "";
            showFeedback(
                "Comentário enviado! Ele aparecerá aqui após ser aprovado.",
                "ok"
            );
        } catch (e) {
            console.error(e);
            showFeedback("Não deu para enviar seu comentário agora. Tente de novo.", "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Enviar comentário";
        }
    }

    // ------------------------------------------------------------------
    // CARREGAR COMENTÁRIOS APROVADOS
    // ------------------------------------------------------------------
    async function loadComments() {
        try {
            const res = await fetch(
                `${ENDPOINT_LIST_COMMENTS}?slug=${encodeURIComponent(ARTICLE_SLUG)}`
            );
            if (!res.ok) throw new Error("Falha ao buscar comentários");
            const data = await res.json();
            renderComments(data.comments || []);
        } catch (e) {
            console.error(e);
            els.commentList.innerHTML =
                '<div class="note"><p>Não foi possível carregar os comentários agora.</p></div>';
            els.commentCount.textContent = "";
        }
    }

    function renderComments(list) {
        els.commentCount.textContent = list.length
            ? `${list.length} comentário${list.length > 1 ? "s" : ""}`
            : "Nenhum comentário ainda — seja o primeiro.";

        if (!list.length) {
            els.commentList.innerHTML = "";
            return;
        }

        els.commentList.innerHTML = list
            .map(
                (c) => `
        <div class="comment-item">
          <img class="avatar-img" src="${escapeHtml(c.picture || "")}" alt="">
          <div class="body">
            <div class="meta">
              <span class="name">${escapeHtml(c.name || "Anônimo")}</span>
              <span class="date">${formatDate(c.createdAt)}</span>
            </div>
            <div class="text">${escapeHtml(c.texto || "")}</div>
          </div>
        </div>`
            )
            .join("");
    }

    // ------------------------------------------------------------------
    // INIT
    // ------------------------------------------------------------------
    function init() {
        currentSession = loadSession();
        renderAuthState();

        initGoogleSignIn();

        els.btnLogin.addEventListener("click", triggerGoogleLogin);
        els.btnLogout.addEventListener("click", logout);
        els.form.addEventListener("submit", handleSubmit);

        loadComments();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();