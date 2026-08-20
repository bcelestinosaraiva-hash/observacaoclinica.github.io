// ======================================================
// OBSERVAÇÃO CLÍNICA
// ADMINISTRAÇÃO DE COMENTÁRIOS
// ======================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ======================================================
// CONFIGURAÇÃO FIREBASE
// ======================================================

const firebaseConfig = {
    apiKey: "AIzaSyCiuqN0Ms5TiEmM1mdIApbUmlveei4WFvo",
    authDomain: "login-observacaoclinica.firebaseapp.com",
    projectId: "login-observacaoclinica",
    storageBucket: "login-observacaoclinica.firebasestorage.app",
    messagingSenderId: "1085876668661",
    appId: "1:1085876668661:web:2c7b469b40198bab711dbc",
    measurementId: "G-PVKHD1GN4L"
};


// ======================================================
// INICIALIZAR FIREBASE
// ======================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const provider = new GoogleAuthProvider();


// ======================================================
// ADMINISTRADORES AUTORIZADOS
// ======================================================
//
// IMPORTANTE:
// Substitua pelo UID da sua conta Google.
//
// O UID pode ser encontrado em:
// Firebase Console
// > Authentication
// > Users
//
// NÃO coloque apenas o email aqui.
// Use o UID.
//
// ======================================================

const ADMIN_UIDS = [

    "COLOQUE_AQUI_SEU_UID"

];


// ======================================================
// ELEMENTOS
// ======================================================

const loginBox =
    document.getElementById("loginBox");

const dashboard =
    document.getElementById("dashboard");

const googleLogin =
    document.getElementById("googleLogin");

const logoutBtn =
    document.getElementById("logoutBtn");

const adminInfo =
    document.getElementById("adminInfo");

const adminPhoto =
    document.getElementById("adminPhoto");

const adminName =
    document.getElementById("adminName");

const adminEmail =
    document.getElementById("adminEmail");

const loginError =
    document.getElementById("loginError");

const commentsContainer =
    document.getElementById("commentsContainer");

const statusFilter =
    document.getElementById("statusFilter");

const totalComments =
    document.getElementById("totalComments");

const pendingComments =
    document.getElementById("pendingComments");

const approvedComments =
    document.getElementById("approvedComments");

const rejectedComments =
    document.getElementById("rejectedComments");


// ======================================================
// VARIÁVEL DOS COMENTÁRIOS
// ======================================================

let allComments = [];

let unsubscribeComments = null;


// ======================================================
// LOGIN GOOGLE
// ======================================================

googleLogin.addEventListener("click", async () => {

    loginError.style.display = "none";

    try {

        await signInWithPopup(
            auth,
            provider
        );

    } catch (error) {

        console.error(
            "Erro no login:",
            error
        );

        loginError.textContent =
            "Não foi possível iniciar sessão. Tente novamente.";

        loginError.style.display = "block";

    }

});


// ======================================================
// LOGOUT
// ======================================================

logoutBtn.addEventListener("click", async () => {

    try {

        await signOut(auth);

    } catch (error) {

        console.error(
            "Erro ao sair:",
            error
        );

    }

});


// ======================================================
// OBSERVAR AUTENTICAÇÃO
// ======================================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        mostrarLogin();

        return;

    }


    console.log(
        "Utilizador autenticado:",
        user.uid
    );


    // ==================================================
    // VERIFICAR SE É ADMIN
    // ==================================================

    if (!ADMIN_UIDS.includes(user.uid)) {

        console.warn(
            "Utilizador não autorizado:",
            user.uid
        );

        mostrarErroAcesso();

        signOut(auth);

        return;

    }


    // ==================================================
    // ADMIN AUTORIZADO
    // ==================================================

    mostrarDashboard(user);

    carregarComentarios();

});


// ======================================================
// MOSTRAR LOGIN
// ======================================================

function mostrarLogin() {

    loginBox.style.display = "block";

    dashboard.style.display = "none";

    adminInfo.style.display = "none";

}


// ======================================================
// MOSTRAR DASHBOARD
// ======================================================

function mostrarDashboard(user) {

    loginBox.style.display = "none";

    dashboard.style.display = "block";

    adminInfo.style.display = "flex";


    adminName.textContent =
        user.displayName || "Administrador";


    adminEmail.textContent =
        user.email || "";


    adminPhoto.src =
        user.photoURL ||
        "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg";

}


// ======================================================
// ACESSO NEGADO
// ======================================================

function mostrarErroAcesso() {

    loginBox.style.display = "block";

    dashboard.style.display = "none";

    loginError.textContent =
        "Esta conta Google não está autorizada a acessar a área administrativa.";

    loginError.style.display = "block";

}


// ======================================================
// CARREGAR COMENTÁRIOS
// ======================================================

function carregarComentarios() {

    if (unsubscribeComments) {

        unsubscribeComments();

    }


    commentsContainer.innerHTML = `
        <div class="loading">
            Carregando comentários...
        </div>
    `;


    const commentsRef =
        collection(db, "comments");


    const commentsQuery =
        query(
            commentsRef,
            orderBy("createdAt", "desc")
        );


    unsubscribeComments =
        onSnapshot(

            commentsQuery,

            (snapshot) => {

                allComments = [];


                snapshot.forEach((docSnapshot) => {

                    allComments.push({

                        id: docSnapshot.id,

                        ...docSnapshot.data()

                    });

                });


                atualizarEstatisticas();

                renderizarComentarios();

            },

            (error) => {

                console.error(
                    "Erro ao carregar comentários:",
                    error
                );


                commentsContainer.innerHTML = `
                    <div class="error"
                         style="display:block;">
                        Não foi possível carregar os comentários.
                        Verifique as Firestore Security Rules.
                    </div>
                `;

            }

        );

}


// ======================================================
// ESTATÍSTICAS
// ======================================================

function atualizarEstatisticas() {

    const total =
        allComments.length;


    const pending =
        allComments.filter(
            comment =>
                comment.status === "pending"
        ).length;


    const approved =
        allComments.filter(
            comment =>
                comment.status === "approved"
        ).length;


    const rejected =
        allComments.filter(
            comment =>
                comment.status === "rejected"
        ).length;


    totalComments.textContent =
        total;


    pendingComments.textContent =
        pending;


    approvedComments.textContent =
        approved;


    rejectedComments.textContent =
        rejected;

}


// ======================================================
// RENDERIZAR COMENTÁRIOS
// ======================================================

function renderizarComentarios() {

    const filter =
        statusFilter.value;


    let comments =
        allComments;


    if (filter !== "all") {

        comments =
            allComments.filter(
                comment =>
                    comment.status === filter
            );

    }


    if (comments.length === 0) {

        commentsContainer.innerHTML = `
            <div class="empty">
                Nenhum comentário encontrado.
            </div>
        `;

        return;

    }


    commentsContainer.innerHTML =
        comments
            .map(
                comment =>
                    criarComentarioHTML(comment)
            )
            .join("");


    adicionarEventos();

}


// ======================================================
// HTML DO COMENTÁRIO
// ======================================================

function criarComentarioHTML(comment) {

    const status =
        comment.status || "pending";


    const statusText = {

        pending: "Pendente",

        approved: "Aprovado",

        rejected: "Reprovado"

    }[status] || "Pendente";


    const date =
        formatarData(comment.createdAt);


    const photo =
        comment.userPhoto ||
        "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg";


    const name =
        escaparHTML(
            comment.userName ||
            "Utilizador"
        );


    const email =
        escaparHTML(
            comment.userEmail ||
            ""
        );


    const text =
        escaparHTML(
            comment.text ||
            ""
        );


    const article =
        escaparHTML(
            comment.articleTitle ||
            comment.articleId ||
            "Artigo"
        );


    return `

        <article
            class="comment-card"
            data-id="${comment.id}">

            <div class="comment-header">

                <div class="user">

                    <img
                        src="${photo}"
                        alt="Foto de ${name}">

                    <div>

                        <strong>
                            ${name}
                        </strong>

                        <small>
                            ${email}
                            ${date ? " • " + date : ""}
                        </small>

                    </div>

                </div>


                <span
                    class="status status-${status}">

                    ${statusText}

                </span>

            </div>


            <div class="article">

                Artigo:
                <strong>
                    ${article}
                </strong>

            </div>


            <div class="comment-text">

                ${text}

            </div>


            <div class="actions">

                ${status !== "approved"
            ? `
                        <button
                            class="btn btn-approve"
                            data-action="approve"
                            data-id="${comment.id}">
                            Aprovar
                        </button>
                    `
            : ""
        }


                ${status !== "rejected"
            ? `
                        <button
                            class="btn btn-reject"
                            data-action="reject"
                            data-id="${comment.id}">
                            Reprovar
                        </button>
                    `
            : ""
        }


                <button
                    class="btn btn-delete"
                    data-action="delete"
                    data-id="${comment.id}">
                    Excluir
                </button>

            </div>

        </article>

    `;

}


// ======================================================
// EVENTOS DOS BOTÕES
// ======================================================

function adicionarEventos() {

    document
        .querySelectorAll("[data-action]")
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const action =
                        button.dataset.action;

                    const id =
                        button.dataset.id;


                    if (action === "approve") {

                        await alterarStatus(
                            id,
                            "approved"
                        );

                    }


                    if (action === "reject") {

                        await alterarStatus(
                            id,
                            "rejected"
                        );

                    }


                    if (action === "delete") {

                        await excluirComentario(id);

                    }

                }
            );

        });

}


// ======================================================
// APROVAR / REPROVAR
// ======================================================

async function alterarStatus(
    commentId,
    status
) {

    try {

        const commentRef =
            doc(
                db,
                "comments",
                commentId
            );


        await updateDoc(
            commentRef,
            {

                status: status,

                moderatedAt:
                    new Date(),

                moderatedBy:
                    auth.currentUser.uid

            }
        );

    } catch (error) {

        console.error(
            "Erro ao alterar comentário:",
            error
        );

        alert(
            "Não foi possível alterar o comentário."
        );

    }

}


// ======================================================
// EXCLUIR
// ======================================================

async function excluirComentario(
    commentId
) {

    const confirmar =
        confirm(
            "Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita."
        );


    if (!confirmar) {

        return;

    }


    try {

        await deleteDoc(
            doc(
                db,
                "comments",
                commentId
            )
        );

    } catch (error) {

        console.error(
            "Erro ao excluir comentário:",
            error
        );

        alert(
            "Não foi possível excluir o comentário."
        );

    }

}


// ======================================================
// FILTRO
// ======================================================

statusFilter.addEventListener(
    "change",
    renderizarComentarios
);


// ======================================================
// FORMATAR DATA
// ======================================================

function formatarData(timestamp) {

    if (!timestamp) {

        return "";

    }


    try {

        const date =
            timestamp.toDate
                ? timestamp.toDate()
                : new Date(timestamp);


        return date.toLocaleString(
            "pt-PT",
            {

                day: "2-digit",

                month: "2-digit",

                year: "numeric",

                hour: "2-digit",

                minute: "2-digit"

            }
        );

    } catch {

        return "";

    }

}


// ======================================================
// PROTEÇÃO CONTRA HTML
// ======================================================

function escaparHTML(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}