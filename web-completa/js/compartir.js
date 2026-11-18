// Compartir un artículo: copia el enlace. El enlace de WhatsApp funciona sin JavaScript.
const botonCopiar = document.querySelector("[data-copiar]");

if (botonCopiar && navigator.clipboard) {
  const estado = document.querySelector(".compartir-estado");
  botonCopiar.hidden = false;
  botonCopiar.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(document.querySelector('link[rel="canonical"]').href);
      estado.textContent = "Enlace copiado.";
    } catch {
      estado.textContent = "No se ha podido copiar. Copia la dirección desde el navegador.";
    }
  });
}
