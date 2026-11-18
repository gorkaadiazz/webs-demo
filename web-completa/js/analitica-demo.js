// DEMO de analítica: este archivo solo se carga si la persona pulsa «Aceptar» en el aviso de cookies.
// Cuenta visitas por página y las guarda SOLO en este navegador. No envía nada a ningún sitio.
// En una web real se sustituye por la herramienta elegida con el cliente (por ejemplo Plausible o Matomo).
(function contarVisita() {
  const CLAVE = "arrieta-visitas";
  let visitas = {};
  try { visitas = JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch { /* sin datos previos */ }
  const pagina = document.title.split(" · ")[0];
  visitas[pagina] = (visitas[pagina] || 0) + 1;
  try { localStorage.setItem(CLAVE, JSON.stringify(visitas)); } catch { /* sin almacenamiento */ }
})();
