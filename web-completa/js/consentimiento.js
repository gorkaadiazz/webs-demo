// Aviso de cookies: la analítica solo se activa si la persona pulsa "Aceptar".
// La elección se guarda en este navegador; "Configurar cookies" (en el pie) permite cambiarla.
const CLAVE = "arrieta-consentimiento-analitica";
const aviso = document.querySelector("#consent");

function leerEleccion() {
  try { return localStorage.getItem(CLAVE); } catch { return null; }
}

function guardarEleccion(valor) {
  try { localStorage.setItem(CLAVE, valor); } catch { /* sin almacenamiento: se volverá a preguntar */ }
}

const RUTA_ANALITICA = new URL("analitica-demo.js", document.currentScript.src).href;

function cargarAnalitica() {
  const script = document.createElement("script");
  script.src = RUTA_ANALITICA;
  document.head.append(script);
  // DEMO: aquí se cargaría la herramienta de analítica elegida con el cliente
  // (por ejemplo Plausible o Matomo). Al añadirla, amplía Content-Security-Policy
  // en netlify.toml y descríbela en cookies.html y privacidad.html.
}

if (aviso) {
  const eleccion = leerEleccion();
  if (eleccion === "aceptar") cargarAnalitica();
  if (!eleccion) aviso.hidden = false;

  aviso.querySelectorAll("[data-consent]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const valor = boton.dataset.consent;
      guardarEleccion(valor);
      aviso.hidden = true;
      if (valor === "aceptar") cargarAnalitica();
      // Al rechazar se borra lo que se hubiera contado antes
      else { try { localStorage.removeItem("arrieta-visitas"); } catch { /* sin almacenamiento */ } }
    });
  });

  document.querySelectorAll("[data-open-consent]").forEach((boton) => {
    boton.addEventListener("click", () => {
      aviso.hidden = false;
      aviso.querySelector("[data-consent]").focus();
    });
  });
}
