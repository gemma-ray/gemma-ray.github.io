/* ============================================================================
   GEMMA & RAY · pàgina d'entrada
   login.js — l'única feina d'aquest fitxer és comprovar la paraula
              i, si és correcta, portar-vos a casament.html
   ==========================================================================*/

/* ========================================
   CONFIGURACIÓ
   ======================================== */
const login = {
  // Contrasenya actual: gemmairay
  //
  // No la guardem en clar, sinó com una empremta, per si algú tafaneja el codi.
  // ⚠️ NO és seguretat de veritat: la comprovació es fa al navegador i qui
  // sàpiga on mirar la pot trobar. Serveix per evitar visites casuals.
  // No poseu mai res sensible darrere d'aquesta porta.
  //
  // Per canviar-la, obriu la consola del navegador en aquesta pàgina i escriviu:
  //   grHash("la-nova-paraula")
  // i enganxeu aquí el resultat.
  hash: "1ma3jmp",

  // On van un cop han encertat
  destination: "./casament.html",

  // Quants dies recordem que ja han entrat
  rememberDays: 120,

  // Poseu-ho a false per obrir el web a tothom: aquesta pàgina
  // passarà de llarg i anirà directament al casament.
  enabled: true
};

const GATE_KEY = "gr-entrada";

/* Empremta senzilla (djb2). Ignora majúscules i espais sobrants, perquè
   ningú no es quedi fora per haver escrit "Gemmairay" amb majúscula. */
function grHash(text) {
  let h = 5381;
  const s = String(text).trim().toLowerCase();
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
window.grHash = grHash;

/* ========================================
   FORMULARI
   ======================================== */
(function () {
  // Web obert a tothom: no fem escriure res a ningú
  if (!login.enabled) {
    location.replace(login.destination);
    return;
  }

  const form = document.getElementById("loginForm");
  const input = document.getElementById("loginPass");
  const error = document.getElementById("loginError");
  const card = document.getElementById("loginCard");
  const peek = document.getElementById("loginPeek");
  const page = document.getElementById("login");
  if (!form || !input) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let attempts = 0;

  // El cursor de fulla també aquí, perquè l'entrada i el web es notin
  // la mateixa cosa. La icona la posa el CSS; això només l'activa.
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (finePointer && !reduced) document.documentElement.classList.add("has-cursor");

  // El focus al camp, però sense fer salts bruscos en obrir la pàgina
  setTimeout(() => input.focus({ preventScroll: true }), reduced ? 0 : 800);

  /* — Mostrar / amagar la paraula — */
  if (peek) {
    peek.addEventListener("click", () => {
      const shown = input.type === "text";
      input.type = shown ? "password" : "text";
      peek.textContent = shown ? "veure" : "amagar";
      peek.setAttribute("aria-pressed", String(!shown));
      peek.setAttribute("aria-label", shown ? "Mostrar la contrasenya" : "Amagar la contrasenya");
      input.focus({ preventScroll: true });
    });
  }

  /* — Quan no encerten — */
  const fail = (message) => {
    if (error) error.textContent = message;
    if (card && !reduced) {
      card.classList.remove("is-wrong");
      void card.offsetWidth; // reinicia l'animació
      card.classList.add("is-wrong");
    }
    input.select();
  };

  /* — Quan encerten — */
  const enter = () => {
    if (error) error.textContent = "";

    try {
      localStorage.setItem(GATE_KEY, "oberta");
      const days = Number(login.rememberDays) || 0;
      if (days > 0) {
        localStorage.setItem(
          GATE_KEY + "-info",
          JSON.stringify({ until: Date.now() + days * 86400000 })
        );
      }
    } catch (e) {
      // Mode privat: el deixem passar igualment, però ho tornarà a demanar
    }

    if (reduced) { location.href = login.destination; return; }

    // Petita transició abans de canviar de pàgina
    if (page) page.classList.add("is-leaving");
    setTimeout(() => { location.href = login.destination; }, 620);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value.trim();

    if (!value) { fail("Escriviu la paraula, si us plau."); return; }

    if (grHash(value) === login.hash) { enter(); return; }

    attempts += 1;
    fail(
      attempts === 1 ? "No és aquesta. Torneu-ho a provar."
      : attempts === 2 ? "Tampoc. La trobareu a la invitació."
      : "Escriviu-nos i us la tornem a enviar de seguida."
    );
  });

  // Mentre escriuen, esborrem l'error
  input.addEventListener("input", () => {
    if (error && error.textContent) error.textContent = "";
  });
})();
