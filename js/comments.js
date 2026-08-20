import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

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
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ==========================================
// FIREBASE
// ==========================================

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

const db = getFirestore(app);

const provider = new GoogleAuthProvider();


// ==========================================
// ARTIGO ATUAL
// ==========================================

const commentsSection =
    document.getElementById("comentarios");

const articleId =
    commentsSection.dataset.articleId;

const articleTitle =
    commentsSection.dataset.articleTitle;


// ==========================================
// ELEMENTOS
// ==========================================

const loginArea =
    document.getElementById("login-area");

const loginButton =
    document.getElementById("google-login");

const userArea =
    document.getElementById("user-area");

const userName =
    document.getElementById("user-name");

const userEmail =
    document.getElementById("user-email");

const userPhoto =
    document.getElementById("user-photo");

const logoutButton =
    document.getElementById("logout");

const commentsArea =
    document.getElementById("comments-area");

const commentForm =
    document.getElementById("comment-form");

const commentText =
    document.getElementById("comment-text");

const commentMessage =
    document.getElementById("comment-message");

const submitButton =
    document.getElementById("submit-comment");

const commentsList =
    document.getElementById("comments-list");


// ==========================================
// LOGIN GOOGLE
// ==========================================

loginButton.addEventListener("click", async () => {

    try {

        loginButton.disabled = true;

        loginButton.querySelector("span").textContent =
            "A entrar...";

        await signInWithPopup(
            auth,
            provider
        );

    } catch (error) {

        console.error(error);

        if (
            error.code !==
            "auth/popup-closed-by-user"
        ) {

            alert(
                "Não foi possível entrar com Google."
            );

        }

    } finally {

        loginButton.disabled = false;

        loginButton.querySelector("span").textContent =
            "Entrar com Google";

    }

});


// ==========================================
// ESTADO DO UTILIZADOR
// ==========================================

onAuthStateChanged(auth, (user) => {

    if (user) {

        loginArea.hidden = true;

        userArea.hidden = false;

        commentsArea.hidden = false;


        userName.textContent =
            user.displayName || "Utilizador";


        userEmail.textContent =
            user.email || "";


        if (user.photoURL) {

            userPhoto.src =
                user.photoURL;

            userPhoto.alt =
                `Foto de ${user.displayName || "utilizador"}`;

        }

    } else {

        loginArea.hidden = false;

        userArea.hidden = true;

        commentsArea.hidden = true;

    }

});


// ==========================================
// LOGOUT
// ==========================================

logoutButton.addEventListener("click", async () => {

    try {

        await signOut(auth);

    } catch (error) {

        console.error(
            "Erro ao sair:",
            error
        );

    }

});


// ==========================================
// ENVIAR COMENTÁRIO
// ==========================================

commentForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const user = auth.currentUser;

    if (!user) {

        alert(
            "Entre com Google antes de comentar."
        );

        return;

    }


    const text =
        commentText.value.trim();


    if (!text) {

        return;

    }


    try {

        submitButton.disabled = true;

        submitButton.textContent =
            "Enviando...";


        await addDoc(
            collection(db, "comments"),
            {

                articleId: articleId,

                articleTitle: articleTitle,

                userId: user.uid,

                userName:
                    user.displayName ||
                    "Utilizador",

                userEmail:
                    user.email || "",

                userPhoto:
                    user.photoURL || "",

                text: text,

                status: "pending",

                createdAt:
                    serverTimestamp(),

                moderatedAt: null

            }
        );


        commentText.value = "";


        commentMessage.textContent =
            "Comentário enviado. Aguarde a aprovação.";

        commentMessage.className =
            "success-message";


    } catch (error) {

        console.error(error);

        commentMessage.textContent =
            "Não foi possível enviar o comentário.";

        commentMessage.className =
            "error-message";

    } finally {

        submitButton.disabled = false;

        submitButton.textContent =
            "Enviar comentário";

    }

});


// ==========================================
// CARREGAR COMENTÁRIOS APROVADOS
// ==========================================

const commentsQuery = query(

    collection(db, "comments"),

    where(
        "articleId",
        "==",
        articleId
    ),

    where(
        "status",
        "==",
        "approved"
    ),

    orderBy(
        "createdAt",
        "desc"
    )

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

            const comment =
                doc.data();


            const articleComment =
                document.createElement("article");

            articleComment.className =
                "comment";


            const avatar =
                document.createElement("img");

            avatar.className =
                "comment-avatar";

            avatar.width = 40;

            avatar.height = 40;

            avatar.src =
                comment.userPhoto ||
                "/img/avatar-default.webp";

            avatar.alt =
                "";


            const body =
                document.createElement("div");

            body.className =
                "comment-body";


            const name =
                document.createElement("strong");

            name.textContent =
                comment.userName ||
                "Utilizador";


            const text =
                document.createElement("p");

            text.textContent =
                comment.text;


            body.appendChild(name);

            body.appendChild(text);


            articleComment.appendChild(
                avatar
            );

            articleComment.appendChild(
                body
            );


            commentsList.appendChild(
                articleComment
            );

        });

    },

    (error) => {

        console.error(
            "Erro ao carregar comentários:",
            error
        );

        commentsList.innerHTML = `
            <p class="error-message">
                Não foi possível carregar os comentários.
            </p>
        `;

    }

);