import { auth } from "./firebase-config.js";
import {
    getFirestore,
    doc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore();

let mapa, marcador;
let seguimientoActivo = false;

function solicitarPermisoUbicacion() {
    if (!navigator.geolocation) {
        alert("❌ Tu dispositivo no soporta geolocalización.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        () => console.log("📍 Permisos de ubicación concedidos."),
        () => alert("⚠️ Rechazaste el permiso de ubicación.")
    );
}

function iniciarMapa(lat, lng) {
    mapa = L.map("map").setView([lat, lng], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapa);
    marcador = L.marker([lat, lng]).addTo(mapa).bindPopup("Tu ubicación");
}

function actualizarUbicacion(uid) {
    if (!seguimientoActivo) return;

    navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        const refDoc = doc(db, "choferes", uid);
        updateDoc(refDoc, {
            ubicacion: { lat: latitude, lng: longitude }
        });
        if (!mapa) iniciarMapa(latitude, longitude);
        else marcador.setLatLng([latitude, longitude]);
    });
}

function activarSeguimiento(uid) {
    seguimientoActivo = true;
    actualizarUbicacion(uid);
    setInterval(() => actualizarUbicacion(uid), 10000);
}

function actualizarUIChofer(data) {
    const estadoDiv = document.getElementById("estadoChofer");
    estadoDiv.innerText = data.online ? "🟢 Online" : "🔴 Offline";
    estadoDiv.style.backgroundColor = data.online ? "#28a745" : "#cc0000";

    document.getElementById("ingresosTotales").innerText =
        `$${data.ingresos?.toFixed(2) || "0.00"}`;
    document.getElementById("nombreChofer").innerText = data.nombre || "—";
}

function cargarViajes(uid) {
    const contenedor = document.getElementById("listaViajes");
    contenedor.innerHTML = "";

    const viajesRef = collection(db, "viajes");
    const q = query(viajesRef, where("estado", "==", "pendiente"));

    getDocs(q).then((snapshot) => {
        snapshot.forEach((docSnap) => {
            const viaje = docSnap.data();
            if (viaje.asignado) return;

            const div = document.createElement("div");
            div.className = "viaje";
            div.innerHTML = `
        <p><strong>Origen:</strong> ${viaje.origen}</p>
        <p><strong>Destino:</strong> ${viaje.destino}</p>
        <p><strong>Importe:</strong> $${viaje.importe}</p>
        <button>Aceptar viaje</button>
      `;

            div.querySelector("button").addEventListener("click", () => {
                updateDoc(doc(db, "viajes", docSnap.id), {
                    asignado: true,
                    estado: "en progreso",
                    chofer: uid
                });
                alert("✅ Viaje asignado correctamente.");
            });

            contenedor.appendChild(div);
        });
    });
}

function iniciarPanel() {
    if (!navigator.onLine) {
        alert("⚠️ Estás sin conexión a Internet.");
        return;
    }

    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            alert("❌ Sesión no detectada. Iniciá sesión nuevamente.");
            return;
        }

        solicitarPermisoUbicacion();

        const refChofer = doc(db, "choferes", user.uid);
        const snapChofer = await getDoc(refChofer);

        if (!snapChofer.exists()) {
            alert("❌ Chofer no registrado.");
            return;
        }

        const datos = snapChofer.data();
        actualizarUIChofer(datos);
        cargarViajes(user.uid);

        // Cambiar estado Online/Offline
        document.getElementById("botonEstado").addEventListener("click", async () => {
            const nuevoEstado = !datos.online;
            await updateDoc(refChofer, { online: nuevoEstado });
            datos.online = nuevoEstado;
            actualizarUIChofer(datos);

            if (nuevoEstado) activarSeguimiento(user.uid);
        });

        // Botón SOS
        document.getElementById("botonSOS").addEventListener("click", async () => {
            const alertRef = doc(db, `alertas/ALERTA_${Date.now()}`);
            await updateDoc(alertRef, {
                uid: user.uid,
                tipo: "sos",
                timestamp: Date.now()
            });
            alert("🚨 SOS enviado al sistema.");
        });
    });
}

iniciarPanel();
