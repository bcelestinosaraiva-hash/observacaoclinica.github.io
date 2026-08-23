import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCiuqN0Ms5TiEmM1mdIApbUmlveei4WFvo",
    authDomain: "login-observacaoclinica.firebaseapp.com",
    projectId: "login-observacaoclinica",
    storageBucket: "login-observacaoclinica.firebasestorage.app",
    messagingSenderId: "1085876668661",
    appId: "1:1085876668661:web:2c7b469b40198bab711dbc",
    measurementId: "G-PVKHD1GN4L"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

let firestorePromise = null;

function getFirestoreModule() {

    if (!firestorePromise) {

        firestorePromise = import(
            "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
        ).then((firestore) => {

            const db = firestore.getFirestore(app);

            return { ...firestore, db };

        });

    }

    return firestorePromise;

}


// ==========================================
// ARTIGO ATUAL
// ==========================================

const commentsSection = document.getElementById("comentarios");
const articleId = commentsSection?.dataset.articleId;
const articleTitle = commentsSection?.dataset.articleTitle;


// ==========================================
// ELEMENTOS
// ==========================================

const loginArea = document.getElementById("login-area");
const loginButton = document.getElementById("google-login");
const loginButtonLabel = loginButton?.querySelector("span:last-child");

const userArea = document.getElementById("user-area");
const userName = document.getElementById("user-name");
const userEmail = document.getElementById("user-email");
const userPhoto = document.getElementById("user-photo");

const logoutButton = document.getElementById("logout");

const commentsArea = document.getElementById("comments-area");
const commentForm = document.getElementById("comment-form");
const commentText = document.getElementById("comment-text");
const commentMessage = document.getElementById("comment-message");
const submitButton = document.getElementById("submit-comment");

const commentsList = document.getElementById("comments-list");


// ==========================================
// VERIFICAR ELEMENTOS ESSENCIAIS
// ==========================================

if (!loginArea) console.error("Elemento #login-area não encontrado.");
if (!loginButton) console.error("Elemento #google-login não encontrado.");
if (!userArea) console.error("Elemento #user-area não encontrado.");
if (!commentsArea) console.error("Elemento #comments-area não encontrado.");


// ==========================================
// LOGIN COM GOOGLE (via redirect)
// ==========================================
// Ao clicar, a página inteira é redirecionada para o domínio
// de login do Firebase; depois do login, o Google manda o
// utilizador de volta para esta mesma página, e o resultado
// é capturado mais abaixo por getRedirectResult().

if (loginButton) {

    loginButton.addEventListener("click", async () => {

        try {

            loginButton.disabled = true;

            if (loginButtonLabel) {
                loginButtonLabel.textContent = "A entrar...";
            }

            // Guarda que uma tentativa de login foi iniciada,
            // para sabermos, depois do redirect, se devemos
            // mostrar mensagem de erro em caso de falha.
            sessionStorage.setItem("loginRedirectPending", "1");

            await signInWithRedirect(auth, provider);

            // A partir daqui a página vai navegar para fora,
            // então nada mais neste handler chega a executar.

        } catch (error) {

            console.error("Erro ao iniciar login:", error);

            sessionStorage.removeItem("loginRedirectPending");

            alert("Não foi possível iniciar o login com Google. Tente novamente.");

            loginButton.disabled = false;

            if (loginButtonLabel) {
                loginButtonLabel.textContent = "Entrar com Google";
            }

        }

    });

}


// ==========================================
// RESULTADO DO REDIRECT
// ==========================================
// Corre uma vez, assim que o script carrega. Se o utilizador
// acabou de voltar do login do Google, isto resolve com o
// resultado; se não houve redirect nenhum, resolve com null
// e não faz nada.

getRedirectResult(auth)
    .then((result) => {

        sessionStorage.removeItem("loginRedirectPending");

        // Não é preciso fazer nada manualmente com result.user:
        // onAuthStateChanged (abaixo) já vai disparar sozinho
        // e atualizar a interface.

    })
    .catch((error) => {

        console.error("Erro no login:", error);

        sessionStorage.removeItem("loginRedirectPending");

        if (error.code === "auth/account-exists-with-different-credential") {

            alert("Já existe uma conta com este email usando outro método de login.");

        } else {

            alert("Não foi possível entrar com Google. Tente novamente.");

        }

        if (loginButton) loginButton.disabled = false;

        if (loginButtonLabel) {
            loginButtonLabel.textContent = "Entrar com Google";
        }

    });


// ==========================================
// ESTADO DA AUTENTICAÇÃO
// ==========================================

let commentsLoaded = false;

onAuthStateChanged(auth, (user) => {

    if (user) {

        if (loginArea) loginArea.hidden = true;
        if (userArea) userArea.hidden = false;
        if (commentsArea) commentsArea.hidden = false;

        if (userName) {
            userName.textContent = user.displayName || "Utilizador";
        }

        if (userEmail) {
            userEmail.textContent = user.email || "";
        }

        if (userPhoto) {

            if (user.photoURL) {

                userPhoto.src = user.photoURL;
                userPhoto.alt = `Foto de ${user.displayName || "utilizador"}`;

            } else {

                userPhoto.removeAttribute("src");
                userPhoto.alt = "Foto do utilizador";

            }

        }

    } else {

        if (loginArea) loginArea.hidden = false;
        if (userArea) userArea.hidden = true;
        if (commentsArea) commentsArea.hidden = true;

        if (loginButton) loginButton.disabled = false;

        if (loginButtonLabel) {
            loginButtonLabel.textContent = "Entrar com Google";
        }

    }

    // Carrega a lista de comentários (e o Firestore) só
    // na primeira vez que soubermos o estado de login,
    // independentemente de estar autenticado ou não.
    if (!commentsLoaded) {
        commentsLoaded = true;
        loadApprovedComments();
    }

});


// ==========================================
// LOGOUT
// ==========================================

if (logoutButton) {

    logoutButton.addEventListener("click", async () => {

        try {

            await signOut(auth);

        } catch (error) {

            console.error("Erro ao sair:", error);

            alert("Não foi possível sair da conta. Tente novamente.");

        }

    });

}


// ==========================================
// ENVIAR COMENTÁRIO
// ==========================================

if (commentForm) {

    commentForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const user = auth.currentUser;

        if (!user) {
            alert("Entre com Google antes de comentar.");
            return;
        }

        const text = commentText.value.trim();

        if (!text) {
            return;
        }

        try {

            submitButton.disabled = true;
            submitButton.textContent = "Enviando...";

            const { collection, addDoc, serverTimestamp, db } =
                await getFirestoreModule();

            await addDoc(collection(db, "comments"), {

                articleId: articleId,
                articleTitle: articleTitle,

                userId: user.uid,
                userName: user.displayName || "Utilizador",
                userEmail: user.email || "",
                userPhoto: user.photoURL || "",

                text: text,

                status: "pending",

                createdAt: serverTimestamp(),
                moderatedAt: null

            });

            commentText.value = "";

            commentMessage.textContent =
                "Comentário enviado. Aguarde a aprovação.";

            commentMessage.className = "is-success";

        } catch (error) {

            console.error("Erro ao enviar comentário:", error);

            commentMessage.textContent =
                "Não foi possível enviar o comentário.";

            commentMessage.className = "is-error";

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "Enviar comentário";

        }

    });

}


// ==========================================
// CARREGAR COMENTÁRIOS APROVADOS
// (só corre depois do primeiro onAuthStateChanged,
//  e só nesse momento é que o Firestore é importado)
// ==========================================

async function loadApprovedComments() {

    if (!commentsList || !articleId) {
        return;
    }

    const { collection, query, where, orderBy, onSnapshot, db } =
        await getFirestoreModule();

    const commentsQuery = query(

        collection(db, "comments"),

        where("articleId", "==", articleId),
        where("status", "==", "approved"),

        orderBy("createdAt", "desc")

    );

    onSnapshot(

        commentsQuery,

        (snapshot) => {

            commentsList.innerHTML = "";

            if (snapshot.empty) {

                commentsList.innerHTML = `
                    <p class="no-comments">
                        Ainda não há comentários neste artigo.
                    </p>
                `;

                return;

            }

            snapshot.forEach((doc) => {

                const comment = doc.data();

                const item = document.createElement("article");
                item.className = "comment-item";

                const header = document.createElement("div");
                header.className = "comment-item-header";

                const avatar = document.createElement("img");
                avatar.className = "comment-item-photo";
                avatar.width = 40;
                avatar.height = 40;
                avatar.src = comment.userPhoto || "/img/avatar-default.webp";
                avatar.alt = "";

                const userBlock = document.createElement("div");
                userBlock.className = "comment-item-user";

                const name = document.createElement("strong");
                name.textContent = comment.userName || "Utilizador";

                const date = document.createElement("span");
                date.className = "comment-date";

                if (comment.createdAt?.toDate) {

                    date.textContent = comment.createdAt
                        .toDate()
                        .toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                        });

                }

                userBlock.appendChild(name);
                userBlock.appendChild(date);

                header.appendChild(avatar);
                header.appendChild(userBlock);

                const text = document.createElement("p");
                text.className = "comment-item-text";
                text.textContent = comment.text;

                item.appendChild(header);
                item.appendChild(text);

                commentsList.appendChild(item);

            });

        },

        (error) => {

            console.error("Erro ao carregar comentários:", error);

            commentsList.innerHTML = `
                <p class="no-comments">
                    Não foi possível carregar os comentários.
                </p>
            `;

        }

    );

}