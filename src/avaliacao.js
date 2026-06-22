// ================= FIREBASE =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getDatabase,
    ref,
    get,
    set,
    update
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

// Configuração do Firebase
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

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ================= VISITANTE =================
function getVisitorId() {

    let id = localStorage.getItem("visitor_id");

    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("visitor_id", id);
    }

    return id;
}

// ================= FEEDBACK =================
function abrirFeedback() {

    const feedback = document.getElementById("feedback");

    if (feedback) {
        feedback.style.display = "block";
    }
}

// ================= VOTAR =================
window.avaliar = async function (voto) {

    try {

        const artigo = window.location.pathname.replace(/\//g, "_");
        const visitor = getVisitorId();

        const votoRef = ref(
            db,
            "avaliacoes/" + artigo + "/" + visitor
        );

        const snap = await get(votoRef);

        if (snap.exists()) {

            alert("Você já avaliou este artigo.");
            return;
        }

        await set(votoRef, {
            voto: voto,
            comentario: "",
            data: Date.now()
        });

        abrirFeedback();

        carregarEstatisticas();

    } catch (err) {

        console.error(err);

        alert("Erro ao enviar voto.");
    }

};

// ================= ENVIAR COMENTÁRIO =================
window.enviar = async function () {

    try {

        const mensagem = document
            .getElementById("mensagem")
            .value
            .trim();

        if (!mensagem) {

            alert("Escreva uma mensagem.");

            return;
        }

        const artigo = window.location.pathname.replace(/\//g, "_");
        const visitor = getVisitorId();

        await update(
            ref(
                db,
                "avaliacoes/" + artigo + "/" + visitor
            ),
            {
                comentario: mensagem
            }
        );

        document.getElementById("mensagem").value = "";

        alert("Obrigado!");

    } catch (err) {

        console.error(err);

        alert("Erro ao enviar comentário.");
    }

};

// ================= ESTATÍSTICAS =================
async function carregarEstatisticas() {

    try {

        const artigo = window.location.pathname.replace(/\//g, "_");

        const snap = await get(
            ref(
                db,
                "avaliacoes/" + artigo
            )
        );

        const percent = document.querySelector(".percent");
        const small = document.querySelector("small");

        if (!snap.exists()) {

            if (percent)
                percent.innerText = "0%";

            if (small)
                small.innerText = "(0 avaliações)";

            return;
        }

        const dados = snap.val();

        let total = 0;
        let sim = 0;

        for (const i in dados) {

            total++;

            if (dados[i].voto === "Sim") {
                sim++;
            }
        }

        const porcentagem = Math.round(
            (sim / total) * 100
        );

        if (percent)
            percent.innerText = porcentagem + "%";

        if (small)
            small.innerText = "(" + total + " avaliações)";

    } catch (err) {

        console.error(err);
    }
}
// ================= INICIAR =================
document.addEventListener(
    "DOMContentLoaded",
    carregarEstatisticas
);