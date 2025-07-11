import { auth } from "./firebase-config.js";
import {
    getDatabase,
    ref,
    get,
    update,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const database = getDatabase();

// 👤 Cargar estado y datos del chofer
function cargarPanel() {
    auth.onAuthStateChanged(async (user) => {
        if (!user) return;

        const uid = user.uid;
        const choferRef = ref(database, "choferes/" + uid);

        onValue(choferRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                document.getElementById("estadoChofer").innerText = data.online ? "🟢 Conectado" : "🔴 Desconectado";
                document.getElementById("botonEstado").innerText = data.online ? "Desconectarse" : "Conectarse";
                document.getElementById("nombreChofer").innerText = data.nombre || user.email;
                document.getElementById("ingresosTotales").innerText = `$${data.ingresos?.toFixed(2) || "0.00"}`;
            }
        });

        // 🎯 Activar botón de cambio de estado
        document.getElementById("botonEstado").addEventListener("click", async () => {
            const estadoActual = document.getElementById("estadoChofer").innerText.includes("🟢");
            await update(choferRef, {
                online: !estadoActual
            });
        });
    });
}

window.addEventListener("DOMContentLoaded", cargarPanel);
