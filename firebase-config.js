// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCYGlDOL1u4jzLkLWN7Knqoz-9O1XiPQg8",
    authDomain: "grua-chofer.firebaseapp.com",
    projectId: "grua-chofer",
    storageBucket: "grua-chofer.appspot.com",
    messagingSenderId: "370248888486",
    appId: "1:370248888486:web" // Puedes completarlo si tenés el ID completo
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
