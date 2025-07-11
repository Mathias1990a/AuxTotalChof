import { auth } from "./firebase-config.js";
import {
  getDatabase,
  ref,
  onValue,
  update,
  set,
  push
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const database = getDatabase();

auth.onAuthStateChanged((user) => {
  if (!user) return;

  const uid = user.uid;
  const choferRef = ref(database, "choferes/" + uid);
  const viajesRef = ref(database, "viajes");

  // 🔁 Estado online/offline
  document.getElementById("botonEstado").addEventListener("click", () => {
    const estadoActual = document.getElementById("estadoChofer").innerText.includes("🟢");
    update(choferRef, { online: !estadoActual });
  });

  // 📡 Ubicación actual
  function actualizarUbicacion() {
    navigator.geolocation.getCurrentPosition((pos) => {
      update(choferRef, {
        ubicacion: {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }
      });
      document.getElementById("ubicacionChofer").innerText =
        `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
    });
  }
  setInterval(actualizarUbicacion, 10000);
  actualizarUbicacion();

  // 🚨 Botón SOS
  document.getElementById("botonSOS").addEventListener("click", () => {
    const alertaRef = push(ref(database, "alertas"));
    set(alertaRef, {
      uid,
      tipo: "sos",
      timestamp: Date.now()
    });
    alert("🚨 SOS enviado. El administrador será notificado.");
  });

  // 🧠 Datos del chofer + ingresos
  onValue(choferRef, (snap) => {
    const data = snap.val();
    if (!data) return;

    document.getElementById("nombreChofer").innerText = data.nombre || user.email;
    document.getElementById("estadoChofer").innerText = data.online ? "🟢 Conectado" : "🔴 Desconectado";
    document.getElementById("botonEstado").innerText = data.online ? "Desconectarse" : "Conectarse";
    document.getElementById("ingresosTotales").innerText = `$${data.ingresos?.toFixed(2) || "0.00"}`;
  });

  // 📦 Lista de viajes disponibles
  onValue(viajesRef, (snapshot) => {
    const lista = document.getElementById("listaViajes");
    lista.innerHTML = "";

    snapshot.forEach((viajeSnap) => {
      const viaje = viajeSnap.val();
      if (viaje.estado === "pendiente" && !viaje.asignado) {
        const div = document.createElement("div");
        div.style.border = "1px solid #ccc";
        div.style.margin = "10px";
        div.style.padding = "10px";
        div.style.borderRadius = "6px";

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

        lista.appendChild(div);
      }
    });
  });
});
