const GA_ID = "G-64EH1WD16Y";
const CONSENT_KEY = "cookieConsent";
const CONSENT_TTL_DIAS = 180;

function getConsent() {
    try {
        let raw = localStorage.getItem(CONSENT_KEY);
        if (!raw) return null;
        let data = JSON.parse(raw);
        let idadeDias = (Date.now() - data.timestamp) / 864e5;
        if (idadeDias > CONSENT_TTL_DIAS) {
            localStorage.removeItem(CONSENT_KEY);
            return null;
        }
        return data.status;
    } catch (e) {
        return null;
    }
}

function setConsent(status) {
    try {
        localStorage.setItem(CONSENT_KEY, JSON.stringify({ status, timestamp: Date.now() }));
    } catch (e) { }
}

function carregarGTM() {
    if (window.gtmCarregado) return;
    function e() { window.dataLayer.push(arguments) }
    window.gtmCarregado = !0, window.dataLayer = window.dataLayer || [], window.gtag = e, e("js", new Date), e("config", GA_ID);
    let t = document.createElement("script");
    t.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`, t.async = !0, document.head.appendChild(t)
}

function agendarCarregamentoGTM() {
    let e = !1;
    function t() {
        e || (e = !0, o.forEach(e => window.removeEventListener(e, t)), clearTimeout(n), carregarGTM())
    }
    let o = ["scroll", "mousemove", "touchstart", "keydown", "click"];
    o.forEach(e => window.addEventListener(e, t, { once: !0, passive: !0 }));
    var n = setTimeout(t, 5e3)
}

"accepted" === getConsent() && agendarCarregamentoGTM();

function shareWhatsApp() {
    let e = `https://api.whatsapp.com/send?text=${encodeURIComponent("Veja isso: " + window.location.href)}`;
    window.open(e, "_blank", "noopener,noreferrer")
}

function shareFacebook() {
    let e = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(e, "_blank", "noopener,noreferrer")
}

function sharePinterest() {
    let e = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodeURIComponent(document.title)}`;
    window.open(e, "_blank", "noopener,noreferrer")
}

function shareNative() {
    navigator.share ? navigator.share({ title: document.title, url: window.location.href }).catch(() => { }) : alert("Use WhatsApp ou Facebook para partilhar.")
}

document.addEventListener("DOMContentLoaded", () => {
    let e = e => document.getElementById(e),
        t = e("mobile-menu"),
        o = e("mobile-menu-button"),
        n = e("close-menu"),
        a = e("overlay-main"),
        s = 0;

    function i() {
        t && a && (t.classList.add("-translate-x-full"), a.classList.add("hidden"), document.body.style.position = "", document.body.style.top = "", document.body.style.left = "", document.body.style.right = "", document.body.style.width = "", window.scrollTo(0, s))
    }

    o && t && a && o.addEventListener("click", function () {
        t && a && (t.classList.remove("-translate-x-full"), a.classList.remove("hidden"), s = window.scrollY, document.body.style.position = "fixed", document.body.style.top = `-${s}px`, document.body.style.left = "0", document.body.style.right = "0", document.body.style.width = "100%")
    });

    n && t && a && n.addEventListener("click", i);
    a && a.addEventListener("click", i);
    t && a && document.addEventListener("keydown", e => { "Escape" === e.key && i() });

    let r = e("saude-az-toggle-mobile"),
        d = e("saude-az-submenu-mobile"),
        c = e("saude-az-icon-mobile"),
        l = e("bemestar-toggle-mobile"),
        m = e("bemestar-submenu-mobile"),
        h = e("fitness-icon-mobile");

    function u(e, t, o) {
        if (!e || !t || !o) return;
        if (!e.classList.contains("hidden")) return e.classList.add("hidden", "opacity-0", "-translate-y-1"), e.classList.remove("opacity-100", "translate-y-0"), t.classList.remove("rotate-180"), void o.setAttribute("aria-expanded", "false");
        e.classList.remove("hidden"),
            requestAnimationFrame(() => { e.classList.remove("opacity-0", "-translate-y-1"), e.classList.add("opacity-100", "translate-y-0") }),
            t.classList.add("rotate-180"), o.setAttribute("aria-expanded", "true")
    }

    r && r.addEventListener("click", () => { u(d, c, r) });
    l && l.addEventListener("click", () => { u(m, h, l) });

    let p = e("search-btn"), w = e("search-input");
    p && w && (
        p.addEventListener("click", e => { e.stopPropagation(), p.classList.add("hidden"), w.classList.remove("hidden"), w.focus() }),
        w.addEventListener("click", e => { e.stopPropagation() }),
        document.addEventListener("click", () => { w.classList.add("hidden"), p.classList.remove("hidden") })
    );

    let y = e("share-facebook"), f = e("share-twitter"), b = e("share-whatsapp"), L = e("share-email"),
        g = encodeURIComponent(window.location.href), v = encodeURIComponent(document.title);
    y && (y.href = `https://www.facebook.com/sharer/sharer.php?u=${g}`);
    f && (f.href = `https://twitter.com/intent/tweet?url=${g}&text=${v}`);
    b && (b.href = `https://wa.me/?text=${v}%20${g}`);
    L && (L.href = `mailto:?subject=${v}&body=${v}%0A${g}`);



    let k = e("cookie-banner"), E = e("acceptCookies"), C = e("rejectCookies");
    if (k) {
        if (!getConsent()) {
            setTimeout(() => { k.classList.add("show") }, 4e3);
        }
        E && E.addEventListener("click", () => {
            setConsent("accepted");
            k.classList.remove("show"), carregarGTM()
        });
        C && C.addEventListener("click", () => {
            setConsent("rejected");
            k.classList.remove("show")
        });
    }

    // Toggle "Saúde de A-Z" — versão desktop
    let saudeAzBtn = e("saude-az-toggle");
    saudeAzBtn && saudeAzBtn.addEventListener("click", () => {
        let isOpen = saudeAzBtn.classList.toggle("open");
        saudeAzBtn.setAttribute("aria-expanded", String(isOpen));
    });
});

window.shareWhatsApp = shareWhatsApp;
window.shareFacebook = shareFacebook;
window.sharePinterest = sharePinterest;
window.shareNative = shareNative;