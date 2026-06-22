import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    set,
    update
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyADiwNWsL36ZBYPVbalBdR9KuxI2EH4PSE",
    authDomain: "avaliacaode-site.firebaseapp.com",
    databaseURL: "https://avaliacaode-site-default-rtdb.firebaseio.com",
    projectId: "avaliacaode-site",
    storageBucket: "avaliacaode-site.firebasestorage.app",
    messagingSenderId: "400865041393",
    appId: "1:400865041393:web:1ee771e269c2d11ec58250"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function getVisitorId() {
    let id = localStorage.getItem("visitor_id");

    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("visitor_id", id);
    }

    return id;
}

function abrirFeedback() {
    const feedback = document.getElementById("feedback");
    if (feedback) feedback.style.display = "block";
}

window.avaliar = async function (voto) {

    const artigo = window.location.pathname.replace(/\//g, "_");
    const visitor = getVisitorId();

    const votoRef = ref(db, `avaliacoes/${artigo}/${visitor}`);

    const snap = await get(votoRef);

    if (snap.exists()) {
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

window.enviar = async function () {

    const msg = document.getElementById("mensagem").value.trim();

    if (!msg) {
        alert("Escreva uma mensagem.");
        return;
    }

    const artigo = window.location.pathname.replace(/\//g, "_");
    const visitor = getVisitorId();

    await update(
        ref(db, `avaliacoes/${artigo}/${visitor}`),
        {
            comentario: msg
        }
    );

    alert("Obrigado!");
};

async function carregarEstatisticas() {

    const artigo = window.location.pathname.replace(/\//g, "_");

    const snap = await get(
        ref(db, `avaliacoes/${artigo}`)
    );

    if (!snap.exists()) return;

    const dados = snap.val();

    let total = 0;
    let sim = 0;

    for (const i in dados) {
        total++;
        if (dados[i].voto === "Sim") sim++;
    }

    const percent = Math.round((sim / total) * 100);

    document.querySelector(".percent").innerText = percent + "%";
    document.querySelector("small").innerText = `(${total} avaliações)`;
}

document.addEventListener(
    "DOMContentLoaded",
    carregarEstatisticas
);