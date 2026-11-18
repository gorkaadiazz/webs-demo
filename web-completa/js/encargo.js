// Encargo: no envía nada a ningún servidor ni cobra nada.
// Junta lo elegido en un mensaje y abre WhatsApp para que la persona lo envíe. Usa js/catalogo.js.
// Lo elegido se guarda solo en esta pestaña del navegador (sessionStorage), hasta cerrarla.
const formulario = document.querySelector("#form-encargo");

if (formulario) {
  const CLAVE_CESTA = "arrieta-encargo";
  const estado = formulario.querySelector(".form-status");
  const fecha = formulario.querySelector("#recogida");
  const pedidoLibre = formulario.querySelector("#pedido");
  const carta = formulario.querySelector("[data-carta]");
  const errorCarta = formulario.querySelector("#carta-error");
  const totalCarta = formulario.querySelector("[data-carta-total]");
  const impreso = document.querySelector(".impreso");

  function textoFecha(d) {
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
  }
  function fechaDesde(valor) {
    return new Date(`${valor}T12:00`);
  }
  function fechaLarga(valor) {
    return fechaDesde(valor).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  }
  // Horas reales desde ahora (hora de Getxo) hasta que abre la tienda el día elegido
  function horasHastaApertura(valor) {
    const dia = fechaDesde(valor);
    const apertura = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 0, APERTURA[dia.getDay()]);
    return (apertura - ahoraGetxo()) / 3600000;
  }

  const manana = ahoraGetxo();
  manana.setDate(manana.getDate() + 1);
  fecha.min = textoFecha(manana);

  // ---------- La cesta ----------
  function leerCesta() {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_CESTA)) || {}; } catch { return {}; }
  }
  const cesta = leerCesta();
  function guardarCesta() {
    try { sessionStorage.setItem(CLAVE_CESTA, JSON.stringify(cesta)); } catch { /* sin almacenamiento: dura hasta recargar */ }
  }

  // «Pedir» desde el catálogo llega como ?anadir=hogaza
  const parametros = new URLSearchParams(location.search);
  const anadir = parametros.get("anadir");
  if (anadir && CATALOGO.some((p) => p.id === anadir)) {
    cesta[anadir] = (cesta[anadir] || 0) + 1;
    guardarCesta();
    history.replaceState(null, "", location.pathname);
  }

  function lineas() {
    return CATALOGO.filter((p) => cesta[p.id] > 0).map((p) => ({ ...p, cantidad: cesta[p.id] }));
  }
  function total() {
    return lineas().reduce((suma, l) => suma + (l.precio === null ? 0 : l.precio * l.cantidad), 0);
  }
  function hayAConsultar() {
    return lineas().some((l) => l.precio === null);
  }
  function etiquetaTotal() {
    return hayAConsultar() ? "Total aproximado, sin lo que se consulta" : "Total aproximado";
  }

  // Devuelve el problema de un producto para la fecha elegida, o "" si no hay
  function problema(producto) {
    if (!fecha.value) return "";
    const dia = fechaDesde(fecha.value).getDay();
    if (!DIAS_ABIERTO.includes(dia)) return "";
    if (!producto.dias.includes(dia)) return `Solo los ${producto.diasTexto}. Cambia el día o quítalo.`;
    if (producto.antelacion === 2 && horasHastaApertura(fecha.value) < 48) return "Necesita 48 horas de antelación. Elige un día más tarde o quítalo.";
    return "";
  }

  // ---------- Dibujar la carta ----------
  const filas = new Map();
  const TITULOS = { pan: "Panes", bolleria: "Bollería", encargo: "Por encargo, con 48 horas" };
  for (const grupo of Object.keys(TITULOS)) {
    const titulo = document.createElement("h2");
    titulo.textContent = TITULOS[grupo];
    const lista = document.createElement("ul");
    lista.className = "carta-lista";
    for (const producto of CATALOGO.filter((p) => p.grupo === grupo)) {
      const fila = document.createElement("li");

      const info = document.createElement("div");
      const nombre = document.createElement("span");
      nombre.className = "carta-nombre";
      nombre.textContent = producto.nombre;
      const precio = document.createElement("span");
      precio.className = "carta-precio";
      const detalle = producto.precio === null ? "A consultar" : formatoEuros(producto.precio);
      precio.textContent = producto.diasTexto ? `${detalle} · ${producto.diasTexto}` : detalle;
      info.append(nombre, precio);
      if (producto.nota) {
        const nota = document.createElement("span");
        nota.className = "carta-precio";
        nota.textContent = producto.nota;
        info.append(nota);
      }

      const pasos = document.createElement("div");
      pasos.className = "pasos";
      const menos = document.createElement("button");
      menos.type = "button";
      menos.textContent = "−";
      menos.setAttribute("aria-label", `Quitar ${producto.nombre}`);
      const cuenta = document.createElement("output");
      cuenta.setAttribute("aria-live", "polite");
      cuenta.setAttribute("aria-label", `Cantidad de ${producto.nombre}`);
      const mas = document.createElement("button");
      mas.type = "button";
      mas.textContent = "+";
      mas.setAttribute("aria-label", `Añadir ${producto.nombre}`);
      pasos.append(menos, cuenta, mas);

      const aviso = document.createElement("p");
      aviso.className = "carta-aviso";

      menos.addEventListener("click", () => cambiar(producto.id, -1));
      mas.addEventListener("click", () => cambiar(producto.id, 1));
      fila.append(info, pasos, aviso);
      lista.append(fila);
      filas.set(producto.id, { menos, cuenta, aviso, producto });
    }
    carta.insertBefore(titulo, errorCarta);
    carta.insertBefore(lista, errorCarta);
  }
  carta.hidden = false;
  pedidoLibre.required = false;

  function cambiar(id, salto) {
    cesta[id] = Math.min(99, Math.max(0, (cesta[id] || 0) + salto));
    if (!cesta[id]) delete cesta[id];
    guardarCesta();
    pintar();
    if (formulario.dataset.intentado) validarCarta();
  }

  function pintar() {
    for (const [id, { menos, cuenta, aviso, producto }] of filas) {
      const cantidad = cesta[id] || 0;
      cuenta.textContent = cantidad;
      menos.disabled = cantidad === 0;
      aviso.textContent = cantidad ? problema(producto) : "";
    }
    totalCarta.textContent = "";
    if (total() > 0) {
      const etiqueta = document.createElement("span");
      etiqueta.textContent = etiquetaTotal();
      const valor = document.createElement("b");
      valor.textContent = formatoEuros(total());
      totalCarta.append(etiqueta, valor);
    }
    imprimir();
    pintarResumen();
  }

  // En el móvil el tique queda abajo: este resumen fijo lo mantiene a la vista
  function pintarResumen() {
    const resumen = document.querySelector("[data-resumen]");
    const unidades = lineas().reduce((suma, l) => suma + l.cantidad, 0);
    resumen.hidden = unidades === 0;
    document.body.classList.toggle("con-resumen", unidades > 0);
    const piezas = unidades === 1 ? "1 producto" : `${unidades} productos`;
    resumen.querySelector("[data-resumen-texto]").textContent = total() > 0 ? `${piezas} · ${formatoEuros(total())}` : piezas;
  }

  // ---------- El tique que se imprime en vivo ----------
  const lineasImpresas = impreso.querySelector("[data-impreso-lineas]");
  const totalImpreso = impreso.querySelector("[data-impreso-total]");

  function imprimir() {
    const nuevas = lineas().map((l) => {
      const li = [...lineasImpresas.children].find((x) => x.dataset.id === l.id) || document.createElement("li");
      li.dataset.id = l.id;
      li.textContent = "";
      const nombre = document.createElement("span");
      nombre.textContent = `${l.cantidad} × ${l.nombre}`;
      const precio = document.createElement("b");
      precio.textContent = l.precio === null ? "A consultar" : formatoEuros(l.precio * l.cantidad);
      li.append(nombre, precio);
      return li;
    });
    lineasImpresas.replaceChildren(...nuevas);
    totalImpreso.hidden = total() === 0;
    totalImpreso.querySelector("span").textContent = etiquetaTotal();
    totalImpreso.querySelector("b").textContent = formatoEuros(total());

    let hayAlgo = nuevas.length > 0;
    impreso.querySelectorAll("[data-impreso]").forEach((fila) => {
      const valor = formulario.elements[fila.dataset.impreso].value.trim();
      const texto = valor && fila.dataset.impreso === "recogida" ? fechaLarga(valor) : valor;
      fila.querySelector("p").textContent = texto;
      fila.classList.toggle("tiene", Boolean(texto));
      if (texto) hayAlgo = true;
    });
    impreso.classList.toggle("tiene-algo", hayAlgo);
  }

  // ---------- Comprobaciones ----------
  const mensajes = { nombre: "Escribe tu nombre para saber a quién guardar el pedido." };

  function mensajeFecha() {
    if (!fecha.value) return "Elige un día a partir de mañana.";
    if (fecha.value < fecha.min) return "Elige un día a partir de mañana.";
    if (CIERRES[fecha.value]) return `Ese día cerramos por ${CIERRES[fecha.value]}. Elige otro día.`;
    if (!DIAS_ABIERTO.includes(fechaDesde(fecha.value).getDay())) return "Los lunes cerramos. Elige otro día.";
    return "";
  }

  function marcarCampo(campo, mensaje) {
    const error = formulario.querySelector(`#${campo.id}-error`);
    campo.setAttribute("aria-invalid", String(Boolean(mensaje)));
    error.textContent = mensaje;
    return !mensaje;
  }
  function validarNombre() {
    const campo = formulario.elements.nombre;
    return marcarCampo(campo, campo.value.trim() ? "" : mensajes.nombre);
  }
  function validarFecha() {
    return marcarCampo(fecha, mensajeFecha());
  }
  function validarCarta() {
    const vacia = !lineas().length && !pedidoLibre.value.trim();
    const conProblema = lineas().filter((l) => problema(l));
    if (vacia) errorCarta.textContent = "Elige al menos un producto o escríbelo en «¿Algo más?».";
    else if (conProblema.length) errorCarta.textContent = `Revisa: ${conProblema.map((l) => l.nombre).join(", ")}.`;
    else errorCarta.textContent = "";
    return !vacia && !conProblema.length;
  }

  formulario.elements.nombre.addEventListener("blur", validarNombre);
  fecha.addEventListener("change", () => { validarFecha(); pintar(); if (formulario.dataset.intentado) validarCarta(); });
  formulario.addEventListener("input", (evento) => {
    if (evento.target === formulario.elements.nombre && evento.target.getAttribute("aria-invalid") === "true") validarNombre();
    if (evento.target === pedidoLibre && formulario.dataset.intentado) validarCarta();
    imprimir();
  });

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    formulario.dataset.intentado = "1";
    const cartaBien = validarCarta();
    const fechaBien = validarFecha();
    const nombreBien = validarNombre();
    if (!cartaBien || !fechaBien || !nombreBien) {
      estado.textContent = "";
      // El foco va al primer problema, en el orden de la página
      if (!fechaBien) fecha.focus();
      else if (!cartaBien) carta.querySelector(".pasos button:not(:disabled)").focus();
      else formulario.elements.nombre.focus();
      return;
    }

    const datos = new FormData(formulario);
    const partes = ["Hola, quiero hacer un encargo:"];
    for (const l of lineas()) {
      partes.push(`${l.cantidad} x ${l.nombre}${l.precio === null ? " (a consultar)" : ` (${formatoEuros(l.precio * l.cantidad)})`}`);
    }
    if (total() > 0) partes.push(`Total aproximado: ${formatoEuros(total())}${hayAConsultar() ? ", sin lo que se consulta" : ""}`);
    if (datos.get("pedido").trim()) partes.push(`Además: ${datos.get("pedido").trim()}`);
    partes.push(`Recogida: ${fechaLarga(datos.get("recogida"))}`);
    partes.push(`Nombre: ${datos.get("nombre").trim()}`);
    if (datos.get("notas").trim()) partes.push(`Notas: ${datos.get("notas").trim()}`);

    window.open(`${formulario.action}?text=${encodeURIComponent(partes.join("\n"))}`, "_blank", "noopener");
    prepararRecordatorio(datos.get("recogida"));
    estado.textContent = "Envía el mensaje en WhatsApp y te confirmaremos el encargo y el precio final. Si no se ha abierto, llámanos al 944 00 00 00.";
    // Que el mensaje quede a la vista y no tapado por el resumen fijo del móvil
    estado.scrollIntoView({ block: "nearest" });
  });

  // Recordatorio: un archivo .ics que cualquier calendario del móvil puede abrir. Se crea aquí, sin enviar nada.
  function prepararRecordatorio(valor) {
    const enlace = document.querySelector("[data-recordatorio]");
    const dia = fechaDesde(valor);
    const minutos = APERTURA[dia.getDay()];
    const compacta = valor.replaceAll("-", "");
    const horaInicio = `${String(Math.floor(minutos / 60)).padStart(2, "0")}${String(minutos % 60).padStart(2, "0")}00`;
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Panaderia Arrieta//Demo//ES", "BEGIN:VEVENT",
      `UID:encargo-${compacta}@panaderia-arrieta`, `DTSTAMP:${compacta}T000000`,
      `DTSTART:${compacta}T${horaInicio}`, "DURATION:PT1H",
      "SUMMARY:Recoger encargo en Panadería Arrieta", "LOCATION:Calle Mayor\\, 14\\, Getxo",
      "END:VEVENT", "END:VCALENDAR", "",
    ].join("\r\n");
    enlace.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    enlace.hidden = false;
  }

  pintar();
}
