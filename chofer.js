import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("⚠️ Por favor ingresá correo y contraseña.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Login exitoso:", userCredential.user.uid);

    // 🔁 Redirigir al panel del chofer
    window.location.href = "/panelChofer.html";
  } catch (error) {
    console.error("❌ Error en login:", error.code, error.message);
    alert("❌ No se pudo iniciar sesión: " + error.message);
  }
}

window.login = login;
