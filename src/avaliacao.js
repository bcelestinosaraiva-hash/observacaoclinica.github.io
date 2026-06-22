import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    set,
    update
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

// CONFIG FIREBASE (OK)
const firebaseConfig = {
    apiKey: "AIzaSyADiwNWsL36ZBYPVbalBdR9KuxI2EH4PSE",
    authDomain: "avaliacaode-site.firebaseapp.com",
    databaseURL: "https://avaliacaode-site-default-rtdb.firebaseio.com",
    projectId: "avaliacaode-site",
    storageBucket: "avaliacaode-site.firebasestorage.app",
    messagingSenderId: "400865041393",
    appId: "1:400865041393:web:1ee771e269c2d11ec58250"
};

// INIT
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ID VISITANTE
function getVisitorId() {
    let id = localStorage.getItem("visitor_id");

    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("visitor_id", id);
    }

    return id;
}

// FEEDBACK UI
function abrirFeedback() {
    const feedback = document.getElementById("feedback");
    if (feedback) feedback.style.display = "block";
}

// PROTEGER ERROS DE REDE (IMPORTANTE)
async function safeGet(refPath) {
    try {
        return await get(refPath);
    } catch (e) {
        console.error("Erro Firebase GET:", e);
        return null;
    }
}

// AVALIAR
window.avaliar = async function (voto) {
    const artigo = window.location.pathname.replace(/\//g, "_");
    const visitor = getVisitorId();

    const votoRef = ref(db, `avaliacoes/${artigo}/${visitor}`);

    const snap = await safeGet(votoRef);

    if (snap && snap.exists()) {
        alert("Você já avaliou este artigo.");
        return;
    }

    await set(votoRef, {
        voto,
        comentario: "",
        data: Date.now()
    });

    abrirFeedback();
    carregarEstatisticas();
};

// ENVIAR COMENTÁRIO
window.enviar = async function () {
    const msg = document.getElementById("mensagem")?.value?.trim();

    if (!msg) {
        alert("Escreva uma mensagem.");
        return;
    }

    const artigo = window.location.pathname.replace(/\//g, "_");
    const visitor = getVisitorId();

    await update(ref(db, `avaliacoes/${artigo}/${visitor}`), {
        comentario: msg
    });

    alert("Obrigado!");
};

// ESTATÍSTICAS
async function carregarEstatisticas() {
    const artigo = window.location.pathname.replace(/\//g, "_");

    const snap = await safeGet(ref(db, `avaliacoes/${artigo}`));

    if (!snap || !snap.exists()) return;

    const dados = snap.val();

    let total = 0;
    let sim = 0;

    for (const i in dados) {
        total++;
        if (dados[i]?.voto === "Sim") sim++;
    }

    const percent = total ? Math.round((sim / total) * 100) : 0;

    const percentEl = document.querySelector(".percent");
    const smallEl = document.querySelector("small");

    if (percentEl) percentEl.innerText = percent + "%";
    if (smallEl) smallEl.innerText = `(${total} avaliações)`;
}

// INIT DOM
document.addEventListener("DOMContentLoaded", carregarEstatisticas);