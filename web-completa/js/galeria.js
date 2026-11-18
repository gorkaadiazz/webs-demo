// Galería: abre cada foto en grande dentro de un <dialog>, con anterior, siguiente y Esc.
// Sin JavaScript cada miniatura es un enlace normal a la foto.
const visor = document.querySelector("#visor");

if (visor) {
  const enlaces = [...document.querySelectorAll("[data-galeria] a")];
  const imagen = visor.querySelector("img");
  const pie = visor.querySelector("figcaption");
  let actual = 0;

  function mostrar(indice) {
    actual = (indice + enlaces.length) % enlaces.length;
    const enlace = enlaces[actual];
    const miniatura = enlace.querySelector("img");
    imagen.src = enlace.href;
    imagen.alt = miniatura.alt;
    pie.textContent = `${actual + 1} de ${enlaces.length}. ${miniatura.alt}`;
  }

  enlaces.forEach((enlace, indice) => {
    enlace.addEventListener("click", (evento) => {
      evento.preventDefault();
      mostrar(indice);
      visor.showModal();
    });
  });
  visor.querySelector("[data-anterior]").addEventListener("click", () => mostrar(actual - 1));
  visor.querySelector("[data-siguiente]").addEventListener("click", () => mostrar(actual + 1));
  visor.querySelector("[data-cerrar]").addEventListener("click", () => visor.close());
  visor.addEventListener("keydown", (evento) => {
    if (evento.key === "ArrowLeft") mostrar(actual - 1);
    if (evento.key === "ArrowRight") mostrar(actual + 1);
  });
  // Pulsar fuera de la foto también cierra
  visor.addEventListener("click", (evento) => { if (evento.target === visor) visor.close(); });
}
