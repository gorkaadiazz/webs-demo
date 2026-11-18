// Catálogo de la panadería. Es la fuente de datos de «Hoy en el horno», los filtros
// y, en el plan Avanzado, el encargo. Si cambia un precio o un día, cámbialo aquí Y en el HTML.
// dias: 0 domingo, 1 lunes ... 6 sábado. antelacion: días mínimos para encargarlo. precio null = a consultar.
const DIAS_ABIERTO = [2, 3, 4, 5, 6, 0];
const NOMBRE_DIA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
// Hora de apertura y de último cierre de cada día, en minutos desde medianoche (también en js/estado.js y el HTML)
const APERTURA = { 0: 480, 2: 450, 3: 450, 4: 450, 5: 450, 6: 480 };
const CIERRE = { 0: 810, 2: 1200, 3: 1200, 4: 1200, 5: 1200, 6: 870 };
const CATALOGO = [
  { id: "hogaza", nombre: "Hogaza de masa madre", precio: 5.8, grupo: "pan", dias: DIAS_ABIERTO, antelacion: 1 },
  { id: "baguette", nombre: "Baguette de la casa", precio: 1.9, grupo: "pan", dias: DIAS_ABIERTO, antelacion: 1 },
  { id: "centeno", nombre: "Pan de centeno y semillas", precio: 6.4, grupo: "pan", dias: DIAS_ABIERTO, antelacion: 1 },
  { id: "chapata", nombre: "Chapata de aceite", precio: 2.2, grupo: "pan", dias: DIAS_ABIERTO, antelacion: 1 },
  { id: "molde", nombre: "Pan de molde integral", precio: 4.5, grupo: "pan", dias: DIAS_ABIERTO, antelacion: 1 },
  { id: "maiz", nombre: "Pan de maíz", precio: 3.9, grupo: "pan", dias: [2, 5], diasTexto: "martes y viernes", antelacion: 1 },
  { id: "croissant", nombre: "Croissant de mantequilla", precio: 1.6, grupo: "bolleria", dias: [6, 0], diasTexto: "sábados y domingos", antelacion: 1 },
  { id: "carolina", nombre: "Carolina de Bilbao", precio: 2.4, grupo: "bolleria", dias: DIAS_ABIERTO, antelacion: 1 },
  { id: "caracola", nombre: "Caracola de crema", precio: 1.9, grupo: "bolleria", dias: [6, 0], diasTexto: "sábados y domingos", antelacion: 1 },
  { id: "pantxineta", nombre: "Pantxineta", precio: 3.2, grupo: "bolleria", dias: DIAS_ABIERTO, antelacion: 1, nota: "Por unidad. Si la quieres entera para 8, dilo en «¿Algo más?»." },
  { id: "tarta", nombre: "Tarta de queso", precio: 28, grupo: "encargo", dias: DIAS_ABIERTO, antelacion: 2, nota: "Para 8–10 personas." },
  { id: "roscon", nombre: "Roscón y panes de fiesta", precio: null, grupo: "encargo", dias: DIAS_ABIERTO, antelacion: 2, nota: "En temporada. Te confirmamos si hay." },
  { id: "bandejas", nombre: "Bandejas para eventos", precio: null, grupo: "encargo", dias: DIAS_ABIERTO, antelacion: 2 },
];

function formatoEuros(valor) {
  return `${valor.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

// Fecha y hora en Getxo, aunque quien mire esté en otro país
function ahoraGetxo() {
  const partes = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const v = (tipo) => Number(partes.find((p) => p.type === tipo).value);
  return new Date(v("year"), v("month") - 1, v("day"), v("hour"), v("minute"));
}

function fechaTexto(d) {
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
}

// ¿Se abre ese día? Tiene en cuenta el horario y los CIERRES de js/avisos.js
function seAbre(d) {
  return DIAS_ABIERTO.includes(d.getDay()) && !CIERRES[fechaTexto(d)];
}

// El próximo día de horno: hoy si aún no ha cerrado; si no, el siguiente que abre
function proximoDiaDeHorno() {
  const ahora = ahoraGetxo();
  const hoy = ahora.getDay();
  const minutos = ahora.getHours() * 60 + ahora.getMinutes();
  if (seAbre(ahora) && minutos < CIERRE[hoy]) {
    return { dia: hoy, salto: 0, corto: "hoy", largo: `Hoy, ${NOMBRE_DIA[hoy]}`, cerradoHoy: false };
  }
  for (let salto = 1; salto <= 14; salto++) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + salto);
    if (!seAbre(fecha)) continue;
    const dia = fecha.getDay();
    const corto = salto === 1 ? "mañana" : `el ${NOMBRE_DIA[dia]}`;
    const largo = salto === 1 ? `Mañana, ${NOMBRE_DIA[dia]}` : `El ${NOMBRE_DIA[dia]}`;
    return { dia, salto, corto, largo, cerradoHoy: true };
  }
  return null;
}
