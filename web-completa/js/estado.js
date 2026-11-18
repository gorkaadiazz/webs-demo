// Marcador LED: dice si la panadería está abierta ahora, con la hora de Getxo
// aunque quien mire esté en otro país. Respeta los CIERRES de js/avisos.js.
// IMPORTANTE: si cambia el horario, cámbialo aquí, en js/catalogo.js y en el HTML.
// Clave: 0 domingo, 1 lunes ... 6 sábado. Horas en minutos desde medianoche.
const HORARIO = {
  0: [[480, 810]],
  1: [],
  2: [[450, 840], [1020, 1200]],
  3: [[450, 840], [1020, 1200]],
  4: [[450, 840], [1020, 1200]],
  5: [[450, 840], [1020, 1200]],
  6: [[480, 870]],
};
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function ahoraEnGetxo() {
  const partes = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const v = (tipo) => Number(partes.find((p) => p.type === tipo).value);
  return new Date(v("year"), v("month") - 1, v("day"), v("hour"), v("minute"));
}

function textoFechaEstado(d) {
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
}

function turnosDe(d) {
  return CIERRES[textoFechaEstado(d)] ? [] : HORARIO[d.getDay()];
}

function hora(minutos) {
  return `${Math.floor(minutos / 60)}:${String(minutos % 60).padStart(2, "0")}`;
}

function calcularEstado(ahora) {
  const minutos = ahora.getHours() * 60 + ahora.getMinutes();
  const turnos = turnosDe(ahora);
  const abierto = turnos.find(([abre, cierra]) => minutos >= abre && minutos < cierra);
  if (abierto) return { abierto: true, detalle: `Hasta las ${hora(abierto[1])}` };

  const luegoHoy = turnos.find(([abre]) => minutos < abre);
  if (luegoHoy) return { abierto: false, detalle: `Abre a las ${hora(luegoHoy[0])}` };

  for (let salto = 1; salto <= 14; salto++) {
    const siguiente = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + salto);
    const turnosSiguiente = turnosDe(siguiente);
    if (!turnosSiguiente.length) continue;
    const cuando = salto === 1 ? "Mañana" : `El ${DIAS[siguiente.getDay()]}`;
    return { abierto: false, detalle: `${cuando}, ${hora(turnosSiguiente[0][0])}` };
  }
  return { abierto: false, detalle: "" };
}

function pintar() {
  const ahora = ahoraEnGetxo();
  const estado = calcularEstado(ahora);
  document.querySelectorAll("[data-marcador]").forEach((marcador) => {
    marcador.classList.toggle("is-abierto", estado.abierto);
    marcador.querySelector("[data-marcador-estado]").textContent = estado.abierto ? "Abierto" : "Cerrado";
    marcador.querySelector("[data-marcador-detalle]").textContent = estado.detalle;
  });
  document.querySelectorAll("[data-dias]").forEach((fila) => {
    fila.classList.toggle("es-hoy", fila.dataset.dias.split(" ").includes(String(ahora.getDay())));
  });
}

pintar();
setInterval(pintar, 30000);
