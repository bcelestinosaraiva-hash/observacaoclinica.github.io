
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
