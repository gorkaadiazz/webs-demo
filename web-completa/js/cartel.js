// Imprime solo el cartel (el resto de la página se oculta con @media print)
document.querySelector("[data-imprimir]").addEventListener("click", () => window.print());
