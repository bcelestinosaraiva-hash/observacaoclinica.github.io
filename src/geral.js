// ======================================
// OBSERVAÇÃO CLÍNICA - GERAL.JS
// ======================================

document.addEventListener("DOMContentLoaded", () => {

  // ======================================
  // ELEMENTOS
  // ======================================

  const $ = (id) => document.getElementById(id);

  // MENU
  const mobileMenu = $("mobile-menu");
  const openBtn = $("mobile-menu-button");
  const closeBtn = $("close-menu");
  const overlay = $("overlay-main");

  // SUBMENUS
  const saudeToggle = $("saude-az-toggle-mobile");
  const saudeMenu = $("saude-az-submenu-mobile");
  const saudeIcon = $("saude-az-icon-mobile");

  const bemToggle = $("bemestar-toggle-mobile");
  const bemMenu = $("bemestar-submenu-mobile");
  const bemIcon = $("fitness-icon-mobile");

  // PESQUISA
  const searchBtn = $("search-btn");
  const searchInput = $("search-input");

  // COOKIES
  const consent = $("cookieConsent");
  const acceptBtn = $("acceptCookies");
  const denyBtn = $("denyCookies");

  // SHARE
  const fb = $("facebook-share");
  const tw = $("twitter-share");
  const wa = $("whatsapp-share");
  const email = $("email-share");



  // ======================================
  // MENU MOBILE
  // ======================================

  let scrollPosition = 0;

  function lockScroll() {
    scrollPosition = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = "100%";
  }

  function unlockScroll() {

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";

    window.scrollTo(0, scrollPosition);
  }

  function openMenu() {

    mobileMenu.classList.remove("-translate-x-full");

    overlay.classList.remove("hidden");

    lockScroll();
  }

  function closeMenu() {

    mobileMenu.classList.add("-translate-x-full");

    overlay.classList.add("hidden");

    unlockScroll();
  }

  if (openBtn) openBtn.addEventListener("click", openMenu);

  if (closeBtn) closeBtn.addEventListener("click", closeMenu);

  if (overlay) overlay.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") closeMenu();

  });



  // ======================================
  // SUBMENUS
  // ======================================

  function toggleSubmenu(menu, icon, button) {

    const aberto = !menu.classList.contains("hidden");

    if (aberto) {

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

  if (saudeToggle)
    saudeToggle.addEventListener("click", () =>
      toggleSubmenu(saudeMenu, saudeIcon, saudeToggle)
    );

  if (bemToggle)
    bemToggle.addEventListener("click", () =>
      toggleSubmenu(bemMenu, bemIcon, bemToggle)
    );



  // ======================================
  // PESQUISA
  // ======================================

  if (searchBtn && searchInput) {

    searchBtn.addEventListener("click", (e) => {

      e.stopPropagation();

      searchBtn.style.display = "none";

      searchInput.style.display = "block";

      searchInput.focus();

    });

    searchInput.addEventListener("click", (e) => {

      e.stopPropagation();

    });

    document.addEventListener("click", () => {

      searchInput.style.display = "none";

      searchBtn.style.display = "inline-block";

    });

  }



  // ======================================
  // COOKIES
  // ======================================

  if (consent && acceptBtn && denyBtn) {

    const dados = JSON.parse(localStorage.getItem("cookiesConsent") || "{}");

    const hoje = new Date();

    if (
      !dados.date ||
      (hoje - new Date(dados.date)) / 86400000 > 365
    ) {
      consent.classList.add("show");
    }

    function salvar(aceitou) {

      localStorage.setItem(
        "cookiesConsent",
        JSON.stringify({
          accepted: aceitou,
          date: new Date(),
        })
      );

      consent.classList.remove("show");
    }

    acceptBtn.addEventListener("click", () => salvar(true));

    denyBtn.addEventListener("click", () => salvar(false));

  }



  // ======================================
  // SHARE LINKS
  // ======================================

  const pageUrl = encodeURIComponent(location.href);

  const pageTitle = encodeURIComponent(document.title);

  if (fb)
    fb.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;

  if (tw)
    tw.href = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;

  if (wa)
    wa.href = `https://wa.me/?text=${pageTitle}%20${pageUrl}`;

  if (email)
    email.href = `mailto:?subject=${pageTitle}&body=${pageTitle}%0A${pageUrl}`;

});



// ======================================
// SHARE MANUAL
// ======================================

function shareWhatsApp() {

  window.open(

    `https://api.whatsapp.com/send?text=${encodeURIComponent("Veja isso: " + location.href)}`,

    "_blank"

  );

}

function shareFacebook() {

  window.open(

    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}`,

    "_blank"

  );

}

function sharePinterest() {

  window.open(

    `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(location.href)}&description=${encodeURIComponent(document.title)}`,

    "_blank"

  );

}

function shareNative() {

  if (navigator.share) {

    navigator.share({

      title: document.title,

      url: location.href

    });

  } else {

    alert("Use WhatsApp ou Facebook para partilhar.");

  }

}