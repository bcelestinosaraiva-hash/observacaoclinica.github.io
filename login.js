import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
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


// Inicializar Firebase
const app = initializeApp(firebaseConfig);


// Inicializar Authentication
const auth = getAuth(app);


// Provedor Google
const provider = new GoogleAuthProvider();


// Elementos do HTML
const loginArea = document.getElementById("login-area");
const loginButton = document.getElementById("google-login");

const userArea = document.getElementById("user-area");
const userName = document.getElementById("user-name");
const userEmail = document.getElementById("user-email");
const userPhoto = document.getElementById("user-photo");

const logoutButton = document.getElementById("logout");

const commentsArea = document.getElementById("comments-area");


// Login com Google
loginButton.addEventListener("click", async () => {

    try {

        const result = await signInWithPopup(auth, provider);

        console.log("Login realizado:", result.user);

    } catch (error) {

        console.error("Erro no login:", error);

        alert("Erro ao entrar com Google: " + error.message);

    }

});


// Verificar se existe usuário conectado
onAuthStateChanged(auth, (user) => {

    if (user) {

        console.log("Usuário conectado:", user);

        loginArea.hidden = true;

        userArea.hidden = false;

        commentsArea.hidden = false;

        userName.textContent = user.displayName || "Usuário";

        userEmail.textContent = user.email || "";

        if (user.photoURL) {
            userPhoto.src = user.photoURL;
        }

    } else {

        console.log("Nenhum usuário conectado");

        loginArea.hidden = false;

        userArea.hidden = true;

        commentsArea.hidden = true;

    }

});


// Logout
logoutButton.addEventListener("click", async () => {

    try {

        await signOut(auth);

    } catch (error) {

        console.error("Erro ao sair:", error);

    }

});