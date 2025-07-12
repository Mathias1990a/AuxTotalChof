import { auth } from "./firebase-config.js";
import {
    getDatabase,
    ref,
    onValue,
    update,
    push,
    set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const database = getDatabase();

auth.onAuthStateChanged((user) => {
    if (!user) return;

    const uid = user.uid;
    const choferRef = ref(database, "choferes/" + uid);
    const viajesRef = ref(database, "viajes");

    // 🔄 Estado online/offline
    document.getElementById("botonEstado").addEventListener("click", () => {
        const estadoTexto = document.getElementById("estadoChofer").innerText;
        const estaOnline = estadoTexto.includes("🟢");
        update(choferRef, { online: !estaOnline });
    });

    // 📡 Ubicación + Mapa en tiempo real
    let mapa, marcador;

    function iniciarMapa(lat = -34.6, lng = -58.4) {
        mapa = L.map("map").setView([lat, lng], 14);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapa);
        marcador = L.marker([lat, lng]).addTo(mapa).bindPopup("Tu ubicación");
    }

    function actualizarUbicacion() {
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            update(choferRef, {
                ubicacion: {
                    lat: latitude,
                    lng: longitude
                }
            });
            if (!mapa) iniciarMapa(latitude, longitude);
            else marcador.setLatLng([latitude, longitude]);
        });
    }

    setInterval(actualizarUbicacion, 10000);
    actualizarUbicacion();

    // 🚨 SOS
    document.getElementById("botonSOS").addEventListener("click", () => {
        const alertaRef = push(ref(database, "alertas"));
        set(alertaRef, {
            uid,
            tipo: "sos",
            timestamp: Date.now()
        });
        alert("🚨 SOS enviado al sistema.");
    });

    // 🧠 Datos del chofer
    onValue(choferRef, (snap) => {
        const data = snap.val();
        if (!data) return;

        // Estado dinámico
        const estadoDiv = document.getElementById("estadoChofer");
        estadoDiv.innerText = data.online ? "🟢 Online" : "🔴 Offline";
        estadoDiv.style.backgroundColor = data.online ? "#28a745" : "#cc0000";

        document.getElementById("ingresosTotales").innerText =
            `$${data.ingresos?.toFixed(2) || "0.00"}`;
    });

    // 📦 Viajes disponibles
    onValue(viajesRef, (snapshot) => {
        const contenedor = document.getElementById("listaViajes");
        contenedor.innerHTML = "";

        snapshot.forEach((viajeSnap) => {
            const viaje = viajeSnap.val();
            if (viaje.estado === "pendiente" && !viaje.asignado) {
                const div = document.createElement("div");
                div.className = "viaje";
                div.innerHTML = `
          <p><strong>Origen:</strong> ${viaje.origen}</p>
          <p><strong>Destino:</strong> ${viaje.destino}</p>
          <p><strong>Importe:</strong> $${viaje.importe}</p>
          <button>Aceptar viaje</button>
        `;

                div.querySelector("button").addEventListener("click", () => {
                    update(ref(database, "viajes/" + viajeSnap.key), {
                        asignado: true,
                        chofer: uid,
                        estado: "en progreso"
                    });
                    alert("✅ Viaje asignado correctamente.");
                });

                contenedor.appendChild(div);
            }
        });
    });
});
