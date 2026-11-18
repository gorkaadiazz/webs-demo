// Reservas por WhatsApp: no guarda nada ni conecta con ningún servicio.
// La persona elige día, hora y personas, y se abre WhatsApp con la petición para que el negocio la confirme.
// No puede bloquear las horas ya cogidas: para eso hace falta el extra de reservas con gestión.
const cajaReservas = document.querySelector("[data-reservas]");

if (cajaReservas) {
  const HORAS = ["9:00", "10:00", "11:00"]; // Horarios de ejemplo
  const formularioReserva = cajaReservas.querySelector("form");
  const selectorDia = formularioReserva.elements.dia;
  const estadoReserva = formularioReserva.querySelector(".form-status");
  const horas = formularioReserva.querySelector("[data-horas]");

  // Los próximos cuatro sábados en que se abre
  const ahora = ahoraGetxoReservas();
  const fecha = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);
  let cuantos = 0;
  while (cuantos < 4) {
    const clave = [fecha.getFullYear(), String(fecha.getMonth() + 1).padStart(2, "0"), String(fecha.getDate()).padStart(2, "0")].join("-");
    if (fecha.getDay() === 6 && !CIERRES[clave]) {
      const opcion = document.createElement("option");
      opcion.value = fecha.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
      opcion.textContent = opcion.value;
      selectorDia.append(opcion);
      cuantos++;
    }
    fecha.setDate(fecha.getDate() + 1);
  }

  HORAS.forEach((hora, indice) => {
    const etiqueta = document.createElement("label");
    etiqueta.className = "opcion";
    const entrada = document.createElement("input");
    entrada.type = "radio";
    entrada.name = "hora";
    entrada.value = hora;
    if (indice === 0) entrada.checked = true;
    etiqueta.append(entrada, ` ${hora}`);
    horas.append(etiqueta);
  });

  formularioReserva.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = new FormData(formularioReserva);
    const nombre = datos.get("nombre").trim();
    const error = formularioReserva.querySelector("#reserva-nombre-error");
    const campo = formularioReserva.elements.nombre;
    campo.setAttribute("aria-invalid", String(!nombre));
    error.textContent = nombre ? "" : "Escribe tu nombre para apuntar la reserva.";
    if (!nombre) {
      campo.focus();
      return;
    }
    const texto = `Hola, quiero reservar una visita al obrador.\nDía: ${datos.get("dia")}\nHora: ${datos.get("hora")}\nPersonas: ${datos.get("personas")}\nNombre: ${nombre}`;
    window.open(`${formularioReserva.action}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
    estadoReserva.textContent = "Envía el mensaje en WhatsApp y te confirmaremos la visita. Si no se ha abierto, llámanos al 944 00 00 00.";
    // Que el mensaje quede a la vista y no tapado por la barra fija del móvil
    estadoReserva.scrollIntoView({ block: "nearest" });
  });
}

function ahoraGetxoReservas() {
  const [a, m, d] = fechaHoyGetxo().split("-").map(Number);
  return new Date(a, m - 1, d);
}
