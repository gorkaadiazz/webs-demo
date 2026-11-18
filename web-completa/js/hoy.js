// «Hoy en el horno» y filtros del catálogo. Usa js/catalogo.js.
// Si ya ha cerrado, habla del siguiente día que abre, para no anunciar lo que no se puede comprar.
// Sin JavaScript estos bloques siguen ocultos y el catálogo se ve entero.
const horno = proximoDiaDeHorno();
const deEseDia = CATALOGO.filter((p) => p.grupo !== "encargo" && p.dias.includes(horno.dia));
const especiales = deEseDia.filter((p) => p.diasTexto);
const nombresEspeciales = especiales.map((p) => p.nombre.toLowerCase()).join(" y ");
const mayuscula = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

// Panel de la portada
const panel = document.querySelector("[data-hoy]");
if (panel) {
  panel.hidden = false;
  panel.querySelector("[data-hoy-titulo]").textContent = `${horno.largo}, sale del horno`;
  const avisoCierre = horno.cerradoHoy ? `Hoy ya hemos cerrado: abrimos ${horno.corto}. ` : "";
  const tambien = especiales.length ? `${horno.cerradoHoy ? "Ese día" : "Hoy"} también: ${nombresEspeciales}.` : "";
  panel.querySelector("[data-hoy-nota]").textContent = `${avisoCierre}${tambien}`;
  const lista = panel.querySelector("[data-hoy-lista]");
  for (const producto of deEseDia) {
    const fila = document.createElement("div");
    if (producto.diasTexto) fila.classList.add("es-hoy");
    const nombre = document.createElement("dt");
    nombre.textContent = producto.nombre;
    const precio = document.createElement("dd");
    precio.textContent = formatoEuros(producto.precio);
    fila.append(nombre, precio);
    lista.append(fila);
  }
}

// Cinta LED del plan Avanzado: el primer aviso cambia según el día
if (especiales.length || horno.cerradoHoy) {
  const textos = document.querySelectorAll(".marquee-track span");
  if (textos.length) {
    const aviso = especiales.length ? `${mayuscula(horno.corto)} hay ${nombresEspeciales}` : `Abrimos ${horno.corto}`;
    textos[0].textContent = aviso;
    textos[textos.length / 2].textContent = aviso;
  }
}

// Filtros del catálogo
const barra = document.querySelector("[data-filtros]");
if (barra) {
  barra.hidden = false;
  barra.querySelector('[data-filtro="hoy"]').textContent = `Toca ${horno.corto}`;
  const estado = document.querySelector("[data-filtros-estado]");
  const tiques = [...document.querySelectorAll("[data-id]")];
  const grupos = [...document.querySelectorAll("[data-grupo]")];
  const idsDelDia = new Set(deEseDia.map((p) => p.id));

  // Marca solo lo que no se hace todos los días y toca ese día
  for (const tique of tiques) {
    if (!especiales.some((p) => p.id === tique.dataset.id)) continue;
    const sello = document.createElement("span");
    sello.className = "sello-hoy";
    sello.textContent = `Toca ${horno.corto}`;
    tique.querySelector("h3").append(" ", sello);
  }

  function aplicar(filtro) {
    for (const tique of tiques) {
      const producto = CATALOGO.find((p) => p.id === tique.dataset.id);
      tique.hidden = !(filtro === "todo" || (filtro === "hoy" ? idsDelDia.has(producto.id) : producto.grupo === filtro));
    }
    for (const grupo of grupos) grupo.hidden = !grupo.querySelector("[data-id]:not([hidden])");
    const cuantos = tiques.filter((t) => !t.hidden).length;
    if (filtro === "todo") estado.textContent = "";
    else if (filtro === "hoy" && horno.cerradoHoy) estado.textContent = `Hoy ya hemos cerrado. ${cuantos} productos para ${horno.corto}.`;
    else estado.textContent = cuantos === 1 ? "1 producto" : `${cuantos} productos`;
    barra.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filtro === filtro)));
  }

  barra.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button");
    if (boton) aplicar(boton.dataset.filtro);
  });
}
