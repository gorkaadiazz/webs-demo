// Mapa bajo demanda: OpenStreetMap solo se carga cuando la persona pulsa el botón.
// Así no hay conexión a terceros sin su consentimiento (RGPD).
document.querySelectorAll("[data-map-src]").forEach((caja) => {
  const boton = caja.querySelector("[data-load-map]");
  if (!boton) return;
  boton.addEventListener("click", () => {
    const mapa = document.createElement("iframe");
    mapa.src = caja.dataset.mapSrc;
    mapa.title = caja.dataset.mapTitle || "Mapa";
    mapa.loading = "lazy";
    caja.replaceChildren(mapa);
    caja.classList.add("is-loaded");
  });
});
