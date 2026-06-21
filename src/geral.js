// ===== MENU MOBILE =====
document.addEventListener("DOMContentLoaded", () => {
  // ELEMENTOS
  const mobileMenu = document.getElementById("mobile-menu");
  const openBtn = document.getElementById("mobile-menu-button");
  const closeBtn = document.getElementById("close-menu");
  const overlay = document.getElementById("overlay-main");

  // Submenus mobile
  const saudeToggle = document.getElementById("saude-az-toggle-mobile");
  const saudeMenu = document.getElementById("saude-az-submenu-mobile");
  const saudeIcon = document.getElementById("saude-az-icon-mobile");
  const bemToggle = document.getElementById("bemestar-toggle-mobile");
  const bemMenu = document.getElementById("bemestar-submenu-mobile");
  const bemIcon = document.getElementById("fitness-icon-mobile");

  // Pesquisa
  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("search-input");

  // =========================
  // CONTROLE DE SCROLL (SEM DELAY)
  // =========================
  let scrollPosition = 0;

  function lockScroll() {
    scrollPosition = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  function unlockScroll() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, scrollPosition);
  }
  // =========================
  // MENU MOBILE
  // =========================
  function openMenu() {
    mobileMenu.classList.remove("-translate-x-full");
    overlay.classList.remove("show");
    lockScroll(); // 🔥 trava scroll instantaneamente
  }

  function closeMenu() {
    mobileMenu.classList.add("-translate-x-full");
    overlay.classList.add("hidden");

    unlockScroll();
  }
  openBtn.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);
  overlay.addEventListener("click", closeMenu);

  // Fechar com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
  // =========================
  // SUBMENUS MOBILE
  // =========================
  function toggleSubmenu(menu, icon, button) {
    const isOpen = !menu.classList.contains("hidden");

    if (isOpen) {
      menu.classList.add("hidden");
      menu.classList.remove("opacity-100", "translate-y-0");
      menu.classList.add("opacity-0", "-translate-y-1");
      icon.classList.remove("rotate-180");
      button.setAttribute("aria-expanded", "false");
    } else {
      menu.classList.remove("hidden");

      requestAnimationFrame(() => {
        menu.classList.remove("opacity-0", "-translate-y-1");
        menu.classList.add("opacity-100", "translate-y-0");
      });

      icon.classList.add("rotate-180");
      button.setAttribute("aria-expanded", "true");
    }
  }

  if (saudeToggle) {
    saudeToggle.addEventListener("click", () => {
      toggleSubmenu(saudeMenu, saudeIcon, saudeToggle);
    });
  }

  if (bemToggle) {
    bemToggle.addEventListener("click", () => {
      toggleSubmenu(bemMenu, bemIcon, bemToggle);
    });
  }

  // =========================
  // PESQUISA (DESKTOP)
  // =========================
  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      if (searchInput.classList.contains("hidden")) {
        searchInput.classList.remove("hidden");
        searchInput.focus();
      } else {
        searchInput.classList.add("hidden");
      }
    });
  }
});
// ===== MENU MOBILE FIM =====

// ==========================
// COOKIES
// ==========================
document.addEventListener("DOMContentLoaded", function () {
  const consent = document.getElementById("cookieConsent");
  const acceptBtn = document.getElementById("acceptCookies");
  const denyBtn = document.getElementById("denyCookies");

  if (!consent || !acceptBtn || !denyBtn) return;

  function daysBetween(date1, date2) {
    return Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
  }

  const consentData = JSON.parse(localStorage.getItem("cookiesConsent") || "{}");
  const now = new Date();

  if (!consentData.date || daysBetween(new Date(consentData.date), now) > 365) {
    consent.classList.add("show");
  }

  function saveConsent(accepted) {
    localStorage.setItem("cookiesConsent", JSON.stringify({
      accepted,
      date: new Date()
    }));
    consent.classList.remove("show");
  }

  acceptBtn.addEventListener("click", () => saveConsent(true));
  denyBtn.addEventListener("click", () => saveConsent(false));
});

// ==========================
// SHARE LINKS
// ==========================
document.addEventListener("DOMContentLoaded", function () {
  const pageUrl = encodeURIComponent(window.location.href);
  const pageTitle = encodeURIComponent(document.title);

  const fb = document.getElementById("facebook-share");
  const tw = document.getElementById("twitter-share");
  const wa = document.getElementById("whatsapp-share");
  const email = document.getElementById("email-share");

  if (fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
  if (tw) tw.href = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
  if (wa) wa.href = `https://wa.me/?text=${pageTitle}%20${pageUrl}`;
  if (email) email.href = `mailto:?subject=${pageTitle}&body=${pageTitle}%0A${pageUrl}`;
});

// ==========================
// FORM (FORMSPREE)
// ==========================
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const feedback = document.getElementById("feedback");

  if (!form || !feedback) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const mensagem = document.getElementById("mensagem")?.value || "";

    if (mensagem.length < 100) {
      feedback.textContent = "A mensagem deve ter no mínimo 100 caracteres.";
      feedback.style.color = "red";
      return;
    }

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: { Accept: "application/json" }
      });

      if (response.ok) {
        feedback.textContent = "Mensagem enviada com sucesso!";
        feedback.style.color = "green";
        form.reset();
      } else {
        feedback.textContent = "Erro ao enviar. Tente novamente.";
        feedback.style.color = "red";
      }
    } catch (error) {
      feedback.textContent = "Erro de conexão. Verifique sua internet.";
      feedback.style.color = "red";
    }
  });
});

// ==========================
// FUNÇÕES DE SHARE MANUAL
// ==========================
function shareWhatsApp() {
  const url = window.location.href;
  const text = "Veja isso:";
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`, "_blank");
}

function shareFacebook() {
  const url = window.location.href;
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
}

function sharePinterest() {
  const url = window.location.href;
  const image = "";
  const text = document.title;

  window.open(
    `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(text)}`,
    "_blank"
  );
}

function shareNative() {
  const url = window.location.href;

  if (navigator.share) {
    navigator.share({
      title: document.title,
      url: url
    });
  } else {
    alert("Use WhatsApp ou Facebook para partilhar.");
  }
}

// ===== PESQUISA PC =====
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("search-btn");
  const input = document.getElementById("search-input");

  if (!btn || !input) {
    console.log("Elemento não encontrado");
    return;
  }

  btn.onclick = function () {
    if (input.style.display === "block") {
      input.style.display = "none";
    } else {
      input.style.display = "block";
      input.focus();
    }
  };
});

document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("search-btn");
  const input = document.getElementById("search-input");

  if (!btn || !input) {
    console.log("Elemento não encontrado");
    return;
  }

  btn.onclick = function () {
    btn.style.display = "none"; // 👈 esconde a lupa
    input.style.display = "block";
    input.focus();
  };
});

document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("search-btn");
  const input = document.getElementById("search-input");

  btn.onclick = function (e) {
    e.stopPropagation(); // evita fechar imediatamente
    btn.style.display = "none";
    input.style.display = "block";
    input.focus();
  };

  input.addEventListener("click", function (e) {
    e.stopPropagation(); // evita fechar quando clicar dentro
  });

  document.addEventListener("click", function () {
    input.style.display = "none";
    btn.style.display = "inline-block";
  });
});


// ====================
// FIREBASE CONFIG
// ====================
window.avaliar = async function (voto) {
  try {
    console.log("Clique:", voto);

    const artigo = window.location.pathname.replace(/\//g, "_");
    const visitor = getVisitorId();

    if (!firebase || !db) {
      alert("Firebase não carregou.");
      return;
    }
    const ref = db.ref("avaliacoes/" + artigo + "/" + visitor);
    let snap;
    try {
      snap = await ref.get();
    } catch (e) {
      console.log("Erro no GET:", e);
      alert("Erro ao acessar base de dados (Rules do Firebase).");
      return;
    }
    if (snap.exists()) {
      alert("Você já avaliou este artigo.");
      return;
    }
    try {
      await ref.set({
        voto: voto,
        comentario: "",
        data: Date.now()
      });
    } catch (e) {
      console.log("Erro no SET:", e);
      alert("Erro ao salvar no Firebase (Rules bloqueando escrita).");
      return;
    }
    console.log("Voto salvo");
    abrirFeedback();
    carregarEstatisticas();
  } catch (err) {
    console.error("ERRO FINAL:", err);
    alert("Erro geral ao enviar voto.");
  }
};

// ================= FIREBASE =================
const firebaseConfig = {
  apiKey: "AIzaSyADiwNWsL36ZBYPVbalBdR9KuxI2EH4PSE",
  authDomain: "avaliacaode-site.firebaseapp.com",
  databaseURL: "https://avaliacaode-site-default-rtdb.firebaseio.com",
  projectId: "avaliacaode-site",
  storageBucket: "avaliacaode-site.firebasestorage.app",
  messagingSenderId: "400865041393",
  appId: "1:400865041393:web:1ee771e269c2d11ec58250",
  measurementId: "G-MNDVXHQ2F7"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();


// ================= VISITANTE =================
function getVisitorId() {
  let id = localStorage.getItem("visitor_id");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("visitor_id", id);
  }

  return id;
}


// ================= ABRIR FEEDBACK =================
function abrirFeedback() {
  document.getElementById("feedback").style.display = "block";
}


// ================= VOTAR =================
window.avaliar = async function (voto) {
  try {

    const artigo = window.location.pathname.replace(/\//g, "_");
    const visitor = getVisitorId();

    const ref = db.ref("avaliacoes/" + artigo + "/" + visitor);

    const snap = await ref.get();

    if (snap.exists()) {
      alert("Você já avaliou este artigo.");
      return;
    }

    await ref.set({
      voto: voto,
      comentario: "",
      data: Date.now()
    });

    abrirFeedback();
    carregarEstatisticas();

  } catch (err) {
    console.log("ERRO VOTO:", err);
    alert("Erro ao enviar voto. Ver console (F12).");
  }
};


// ================= ENVIAR COMENTÁRIO =================
window.enviar = async function () {
  try {

    const msg = document.getElementById("mensagem").value.trim();

    if (!msg) {
      alert("Escreva uma mensagem.");
      return;
    }

    const artigo = window.location.pathname.replace(/\//g, "_");
    const visitor = getVisitorId();

    await db.ref("avaliacoes/" + artigo + "/" + visitor).update({
      comentario: msg
    });

    alert("Obrigado!");
    document.getElementById("mensagem").value = "";

  } catch (err) {
    console.log("ERRO COMENTARIO:", err);
    alert("Erro ao enviar comentário.");
  }
};


// ================= ESTATÍSTICAS =================
async function carregarEstatisticas() {

  const artigo = window.location.pathname.replace(/\//g, "_");

  const snap = await db.ref("avaliacoes/" + artigo).get();

  if (!snap.exists()) {
    document.querySelector(".percent").innerText = "0%";
    document.querySelector("small").innerText = "(0 avaliações)";
    return;
  }

  const dados = snap.val();

  let total = 0;
  let sim = 0;

  for (let i in dados) {
    total++;
    if (dados[i].voto === "Sim") sim++;
  }

  const percent = Math.round((sim / total) * 100);

  document.querySelector(".percent").innerText = percent + "%";
  document.querySelector("small").innerText = "(" + total + " avaliações)";
}

// iniciar
document.addEventListener("DOMContentLoaded", carregarEstatisticas);
// ================= FIM DE FIREBASE =================




