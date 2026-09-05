/* ============================================================================
   GEMMA & RAY
   drift.js — pètals i fulles que baixen molt de tant en tant

   La idea és que gairebé no es vegi: poques peces, molt lentes i molt
   transparents. Ha de ser una cosa que es descobreix, no un efecte.

   Tot el moviment el fa el navegador amb animacions de CSS, no JavaScript
   fotograma a fotograma: així ho porta el compositor i no costa gairebé res.
   El fitxer el comparteixen la pàgina d'entrada i el web del casament.
   ==========================================================================*/
(function () {
  "use strict";

  /* ── CONFIGURACIÓ ────────────────────────────────────────────────────
     EDIT HERE: si en voleu més o menys, canvieu "quantitat". */
  const drift = {
    quantitat: 11,        // a l'ordinador
    quantitatMobil: 6,    // en pantalles petites
    duradaMin: 26,        // segons que triga a caure
    duradaMax: 46,
    midaMin: 9,           // píxels
    midaMax: 17,
    opacitatMin: 0.14,    // molt discret a propòsit
    opacitatMax: 0.3
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  /* ── LES PECES ───────────────────────────────────────────────────────
     Dibuixades amb el mateix traç de tinta que la resta del web:
     un pètal, una fulla d'olivera i una petita ona. */
  const INK = "%2317365d";      // blau tinta
  const CLAY = "%23c87550";     // terracota
  const BLUE = "%236f91ae";     // blau mediterrani

  const formes = [
    // pètal
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
      '<path d="M12 2c5 4 7 9 5 14-1 4-6 6-9 4s-3-8-1-12c1-2 3-4 5-6z" ' +
      'fill="none" stroke="' + CLAY + '" stroke-width="1.3"/>' +
      '<path d="M12 4c0 6 0 12-2 16" fill="none" stroke="' + CLAY +
      '" stroke-width="0.8" opacity="0.7"/></svg>',
    // fulla d'olivera
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
      '<ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-35 12 12)" ' +
      'fill="none" stroke="' + INK + '" stroke-width="1.3"/>' +
      '<path d="M4 19 20 5" fill="none" stroke="' + INK +
      '" stroke-width="0.8" opacity="0.7"/></svg>',
    // una ona petita
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 12">' +
      '<path d="M1 8c3-5 6-5 9 0s6 5 9 0" fill="none" stroke="' + BLUE +
      '" stroke-width="1.4" stroke-linecap="round"/></svg>'
  ];

  const capa = document.getElementById("drift");
  if (!capa) return;

  const aleatori = (min, max) => min + Math.random() * (max - min);
  const petita = window.matchMedia("(max-width: 700px)").matches;
  const total = petita ? drift.quantitatMobil : drift.quantitat;

  for (let i = 0; i < total; i++) {
    const peca = document.createElement("span");
    peca.className = "drift__peca";

    const forma = formes[Math.floor(Math.random() * formes.length)];
    const mida = aleatori(drift.midaMin, drift.midaMax);

    peca.style.backgroundImage = 'url("data:image/svg+xml,' + forma + '")';
    peca.style.width = mida.toFixed(1) + "px";
    peca.style.height = mida.toFixed(1) + "px";
    peca.style.left = aleatori(-2, 100).toFixed(2) + "%";
    peca.style.setProperty("--o", aleatori(drift.opacitatMin, drift.opacitatMax).toFixed(2));
    peca.style.setProperty("--sway", aleatori(-70, 70).toFixed(0) + "px");
    peca.style.setProperty("--gir", (Math.random() < 0.5 ? -1 : 1) * aleatori(180, 420) + "deg");
    peca.style.animationDuration = aleatori(drift.duradaMin, drift.duradaMax).toFixed(1) + "s";
    // Els retards negatius reparteixen les peces per la pantalla des del
    // primer moment, en lloc de fer-les caure totes juntes al començament.
    peca.style.animationDelay = (-aleatori(0, drift.duradaMax)).toFixed(1) + "s";

    capa.appendChild(peca);
  }

  // Si l'usuari canvia de pestanya, aturem l'animació
  document.addEventListener("visibilitychange", function () {
    capa.style.animationPlayState = document.hidden ? "paused" : "running";
    Array.prototype.forEach.call(capa.children, function (p) {
      p.style.animationPlayState = document.hidden ? "paused" : "running";
    });
  });
})();
