// Panel de estadísticas de la demo: enseña lo que el negocio vería, con las visitas de este navegador.
const tablaVisitas = document.querySelector("[data-visitas]");

if (tablaVisitas) {
  const aviso = document.querySelector("[data-sin-datos]");
  let visitas = {};
  try { visitas = JSON.parse(localStorage.getItem("arrieta-visitas")) || {}; } catch { /* sin datos */ }
  const filas = Object.entries(visitas).sort((a, b) => b[1] - a[1]);
  if (filas.length) {
    aviso.hidden = true;
    tablaVisitas.hidden = false;
    const cuerpo = tablaVisitas.querySelector("tbody");
    for (const [pagina, cuantas] of filas) {
      const fila = cuerpo.insertRow();
      fila.insertCell().textContent = pagina;
      fila.insertCell().textContent = cuantas;
    }
  }
}
