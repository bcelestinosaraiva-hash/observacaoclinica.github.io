import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// ==========================================
// CONFIGURAÇÃO FIREBASE
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


// ==========================================
// INICIALIZAR FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();


// ==========================================
// ELEMENTOS DO HTML
// ==========================================

const loginButton = document.getElementById("google-login");

const userArea = document.getElementById("user-area");
const userName = document.getElementById("user-name");
const userEmail = document.getElementById("user-email");
const userPhoto = document.getElementById("user-photo");

const logoutButton = document.getElementById("logout");

const commentsArea = document.getElementById("comments-area");


// ==========================================
// VERIFICAR ELEMENTOS
// ==========================================

if (!loginButton) {
    console.error("Elemento #google-login não encontrado.");
}

if (!userArea) {
    console.error("Elemento #user-area não encontrado.");
}

if (!commentsArea) {
    console.error("Elemento #comments-area não encontrado.");
}


// ==========================================
// LOGIN COM GOOGLE
// ==========================================

if (loginButton) {

    loginButton.addEventListener("click", async () => {

        try {

            loginButton.disabled = true;
            loginButton.textContent = "A entrar...";

            const result = await signInWithPopup(auth, provider);

            console.log(
                "Login realizado com sucesso:",
                result.user
            );

        } catch (error) {

            console.error("Erro no login:", error);

            if (error.code === "auth/popup-closed-by-user") {

                console.log("A janela de login foi fechada.");

            } else if (error.code === "auth/popup-blocked") {

                alert(
                    "O navegador bloqueou a janela de login. " +
                    "Permita pop-ups para este site e tente novamente."
                );

            } else {

                alert(
                    "Não foi possível entrar com Google. " +
                    "Tente novamente."
                );
            }

        } finally {

            loginButton.disabled = false;
            loginButton.textContent = "Entrar com Google";

        }

    });

}


// ==========================================
// ESTADO DA AUTENTICAÇÃO
// ==========================================

onAuthStateChanged(auth, (user) => {

    if (user) {

        console.log("Usuário conectado:", user);

        // Esconder botão de login
        if (loginButton) {
            loginButton.hidden = true;
        }

        // Mostrar área do utilizador
        if (userArea) {
            userArea.hidden = false;
        }

        // Mostrar comentários
        if (commentsArea) {
            commentsArea.hidden = false;
        }

        // Nome
        if (userName) {
            userName.textContent =
                user.displayName || "Usuário";
        }

        // Email
        if (userEmail) {
            userEmail.textContent =
                user.email || "";
        }

        // Foto
        if (userPhoto) {

            if (user.photoURL) {

                userPhoto.src = user.photoURL;
                userPhoto.alt =
                    `Foto de ${user.displayName || "usuário"}`;

            } else {

                userPhoto.removeAttribute("src");
                userPhoto.alt = "Foto do usuário";

            }
        }

    } else {

        console.log("Nenhum usuário conectado");

        // Mostrar botão de login
        if (loginButton) {
            loginButton.hidden = false;
        }

        // Esconder utilizador
        if (userArea) {
            userArea.hidden = true;
        }

        // Esconder comentários
        if (commentsArea) {
            commentsArea.hidden = true;
        }

    }

});


// ==========================================
// LOGOUT
// ==========================================

if (logoutButton) {

    logoutButton.addEventListener("click", async () => {

        try {

            await signOut(auth);

            console.log("Usuário saiu da conta.");

        } catch (error) {

            console.error("Erro ao sair:", error);

            alert(
                "Não foi possível sair da conta. " +
                "Tente novamente."
            );

        }

    });

}