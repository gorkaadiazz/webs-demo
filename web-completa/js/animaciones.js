// Aparición de los bloques al bajar por la página, una sola vez por elemento.
// Se carga en <head> sin "defer" para marcar la página antes de pintarla y que nada parpadee.
// Sin JavaScript, o si el sistema pide reducir la animación, todo se ve sin efectos.
const OBJETIVOS = [
  ".bread-list li", ".section-head", ".about-cuerpo", ".about-foto", ".group > h2", ".group > p",
  ".prose", ".group > .con-foto", ".visit-grid > *", ".contact > *", ".steps li", ".posts li", ".order", ".impresion", ".proceso-lista li", ".faq details", ".galeria li", ".reservas", ".fechas li", ".fin-articulo",
].join(", ");

const sinAnimacion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !sinAnimacion) {
  document.documentElement.classList.add("anim");

  document.addEventListener("DOMContentLoaded", () => {
    const observador = new IntersectionObserver((entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        entrada.target.classList.add("is-visible");
        observador.unobserve(entrada.target);
      }
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });

    for (const elemento of document.querySelectorAll(OBJETIVOS)) {
      // Escalonado: los hermanos salen uno detrás de otro (80 ms, máximo 5 pasos)
      const hermanos = [...elemento.parentElement.children].filter((h) => h.matches(OBJETIVOS));
      const paso = Math.min(hermanos.indexOf(elemento), 5);
      if (paso > 0) elemento.style.setProperty("--retraso", `${paso * 80}ms`);
      observador.observe(elemento);
    }
  });
}

// Botón para parar la cinta LED de la portada
document.addEventListener("DOMContentLoaded", () => {
  const cinta = document.querySelector(".marquee");
  if (!cinta || sinAnimacion) return;
  const boton = cinta.querySelector(".cinta-pausa");
  boton.hidden = false;
  boton.addEventListener("click", () => {
    const pausada = cinta.classList.toggle("is-pausada");
    boton.textContent = pausada ? "Seguir" : "Parar";
  });
});
