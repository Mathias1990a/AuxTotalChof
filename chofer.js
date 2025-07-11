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
    const user = userCredential.user;

    // Mostrar panel del chofer
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("panelChofer").style.display = "block";
    document.getElementById("datosChofer").innerText = `Bienvenido, ${user.email}`;

    console.log("✅ Login exitoso:", user.uid);
  } catch (error) {
    console.error("❌ Error en login:", error.code, error.message);
    alert("❌ No se pudo iniciar sesión: " + error.message);
  }
}

// ⚠️ Esto permite que el HTML reconozca la función login()
window.login = login;
