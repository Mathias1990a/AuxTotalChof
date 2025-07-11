import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCYlGD0l_1u4zjdLwN7Knqoz-901XiPQg8",
    authDomain: "grua-chofer.firebaseapp.com",
    projectId: "grua-chofer",
    storageBucket: "grua-chofer.appspot.com", // ✅ corregido
    messagingSenderId: "370248888486",
    appId: "1:370248888486:web:8e1d2ba30f0b5d59f94467"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
