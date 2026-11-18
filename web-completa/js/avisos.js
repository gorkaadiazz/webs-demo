// Avisos del negocio y días de cierre especiales.
// El negocio (o quien le mantiene la web) solo tiene que editar estas dos listas.
// AVISOS: se muestran arriba, entre las dos fechas, y se quitan solos al pasar la última.
// CIERRES: días que no se abre aunque toque por horario. Los respetan el marcador, «Hoy en el horno» y los encargos.
const AVISOS = [
  { desde: "2026-11-01", hasta: "2027-01-06", texto: "Ya puedes encargar roscón y panes de fiesta.", enlace: "encargos.html", etiqueta: "Encargar" },
];
const CIERRES = {
  "2026-12-25": "Navidad",
  "2027-01-01": "Año Nuevo",
};

// Fecha de hoy en Getxo, como AAAA-MM-DD
function fechaHoyGetxo() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}

(function mostrarAviso() {
  const hoy = fechaHoyGetxo();
  const aviso = AVISOS.find((a) => a.desde <= hoy && hoy <= a.hasta);
  if (!aviso) return;
  const clave = `arrieta-aviso-${aviso.desde}`;
  try { if (sessionStorage.getItem(clave)) return; } catch { /* sin almacenamiento: se muestra siempre */ }

  const raiz = document.currentScript.src.replace(/js\/avisos\.js.*$/, "");
  const caja = document.createElement("aside");
  caja.className = "aviso-negocio";
  caja.setAttribute("aria-label", "Aviso de la panadería");
  const texto = document.createElement("p");
  texto.textContent = `${aviso.texto} `;
  if (aviso.enlace) {
    const enlace = document.createElement("a");
    enlace.href = raiz + aviso.enlace;
    enlace.textContent = aviso.etiqueta;
    texto.append(enlace);
  }
  const cerrar = document.createElement("button");
  cerrar.type = "button";
  cerrar.textContent = "Cerrar";
  cerrar.setAttribute("aria-label", "Cerrar el aviso");
  cerrar.addEventListener("click", () => {
    caja.remove();
    try { sessionStorage.setItem(clave, "1"); } catch { /* sin almacenamiento */ }
  });
  caja.append(texto, cerrar);
  // Las páginas legales no tienen cabecera: ahí no se muestra
  document.addEventListener("DOMContentLoaded", () => document.querySelector("header.top")?.before(caja));
})();
