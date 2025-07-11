// chofer.js
import { auth, db } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔐 LOGIN Chofer
window.login = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Usuario autenticado:", cred.user.email);

    // ⏳ Esperar verificación en Firestore
    verificarChoferAprobado(cred.user.uid, email);
  } catch (err) {
    alert("❌ Error al iniciar sesión: " + err.message);
  }
};

// 🔍 Validar si está aprobado (usa Firestore si está habilitado)
async function verificarChoferAprobado(uid, email) {
  try {
    const ref = doc(db, "choferes", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      if (data.aprobado) {
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("panelChofer").style.display = "block";
        document.getElementById("datosChofer").innerText =
          `Bienvenido ${data.nombre || email}`;
      } else {
        alert("⚠️ Tu cuenta aún no fue aprobada por el administrador.");
        await signOut(auth);
      }
    } else {
      alert("❌ No se encontró tu perfil como chofer. Contactá con soporte.");
      await signOut(auth);
    }
  } catch (err) {
    alert("Error al verificar cuenta: " + err.message);
    await signOut(auth);
  }
}
