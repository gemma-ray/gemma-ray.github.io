/* ============================================================================
   GEMMA & RAY
   drift.js — pètals que cauen

   Pètals de porcellana i blau pols que baixen gronxant-se i giren en 3D,
   com si els portés la marinada. Només pètals: les floretes petites i
   blanques semblaven neu. N'hi ha a tres profunditats: els de lluny són petits i una
   mica desenfocats, els de prop més grans. Això és el que dona volum.

   Cada peça són dues capes amb dues animacions de CSS:
     · la de fora cau i fa la ziga-zaga del vent  (drift-fall)
     · la de dins gira sobre si mateixa en 3D      (drift-flutter)
   Tot ho porta el compositor del navegador, no JavaScript fotograma a
   fotograma: no costa gairebé res. El fitxer el comparteixen la pàgina
   d'entrada i el web del casament.
   ==========================================================================*/
(function () {
  "use strict";

  /* ── CONFIGURACIÓ ────────────────────────────────────────────────────
     EDIT HERE: si en voleu més o menys, canvieu "quantitat". */
  const drift = {
    quantitat: 22,        // a l'ordinador
    quantitatMobil: 12,   // en pantalles petites
    duradaMin: 18,        // segons que triga a travessar la pantalla
    duradaMax: 34
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  /* ── LES PECES ───────────────────────────────────────────────────────
     Només blancs i blaus, com la resta del web. */
  const svg = (viewBox, body) =>
    'url("data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + viewBox + '">' + body + "</svg>"
    ) + '")';

  const formes = [
    // pètal de porcellana, amb la vora i el cor en blau pàl·lid
    svg("0 0 24 32",
      '<defs><radialGradient id="p" cx="50%" cy="82%" r="85%">' +
      '<stop offset="0" stop-color="#c9d8e8"/><stop offset=".55" stop-color="#eef3f8"/>' +
      '<stop offset="1" stop-color="#dfe8f2"/></radialGradient></defs>' +
      '<path d="M12 31C4 25 1 17 3 10 5 4 9 1 12 1s7 3 9 9c2 7-1 15-9 21z" fill="url(#p)" ' +
      'stroke="#a9bfd6" stroke-width=".7"/>' +
      '<path d="M12 29C11 21 11 12 12 5" fill="none" stroke="#a9bfd6" stroke-width=".55" opacity=".9"/>'),
    // pètal blau pols
    svg("0 0 24 32",
      '<defs><radialGradient id="q" cx="50%" cy="85%" r="85%">' +
      '<stop offset="0" stop-color="#8eaacb"/><stop offset=".6" stop-color="#bfd0e3"/>' +
      '<stop offset="1" stop-color="#e2eaf3"/></radialGradient></defs>' +
      '<path d="M12 31C5 26 2 18 4 11 6 5 9 2 12 1c3 1 6 4 8 10 2 7-1 15-8 20z" fill="url(#q)"/>' +
      '<path d="M12 29C11 21 11 12 12 5" fill="none" stroke="#ffffff" stroke-width=".5" opacity=".6"/>'),
    // pètal llarg i corbat, com els de rosa
    svg("0 0 24 36",
      '<defs><linearGradient id="r" x1="0" y1="1" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#9fb7d1"/><stop offset=".7" stop-color="#dce6f1"/>' +
      '<stop offset="1" stop-color="#f3f6fa"/></linearGradient></defs>' +
      '<path d="M9 35C3 28 2 18 6 10 9 4 14 1 18 2c3 4 3 12 0 20-2 6-5 10-9 13z" fill="url(#r)" ' +
      'stroke="#a9bfd6" stroke-width=".6"/>' +
      '<path d="M9 33C10 24 13 13 17 5" fill="none" stroke="#ffffff" stroke-width=".5" opacity=".7"/>')
  ];

  /* Tres plans de profunditat. Els de lluny, petits, lents i una mica
     borrosos; els de prop, grans i més ràpids. */
  const plans = [
    { pes: 0.3,  mida: [12, 16], opac: [0.5, 0.65],  blur: 0.6, vel: 1.15 },  // lluny
    { pes: 0.5,  mida: [16, 22], opac: [0.7, 0.88],  blur: 0,   vel: 1.0 },   // mig
    { pes: 0.2,  mida: [24, 32], opac: [0.75, 0.92], blur: 1.2, vel: 0.8 }    // a prop
  ];

  const capa = document.getElementById("drift");
  if (!capa) return;

  const aleatori = (min, max) => min + Math.random() * (max - min);
  const triaPla = () => {
    let r = Math.random();
    for (const pla of plans) { if ((r -= pla.pes) <= 0) return pla; }
    return plans[0];
  };
  const petita = window.matchMedia("(max-width: 700px)").matches;
  const total = petita ? drift.quantitatMobil : drift.quantitat;

  for (let i = 0; i < total; i++) {
    const pla = triaPla();
    const mida = aleatori(pla.mida[0], pla.mida[1]) * (petita ? 0.85 : 1);
    const durada = aleatori(drift.duradaMin, drift.duradaMax) * pla.vel;

    const peca = document.createElement("span");
    peca.className = "drift__peca";
    peca.style.left = aleatori(-4, 100).toFixed(2) + "%";
    peca.style.width = mida.toFixed(1) + "px";
    peca.style.height = (mida * 1.3).toFixed(1) + "px";
    peca.style.setProperty("--o", aleatori(pla.opac[0], pla.opac[1]).toFixed(2));
    // dos cops de vent, cap a un costat i després cap a l'altre
    peca.style.setProperty("--sx1", aleatori(-90, 90).toFixed(0) + "px");
    peca.style.setProperty("--sx2", aleatori(-160, 160).toFixed(0) + "px");
    peca.style.animationDuration = durada.toFixed(1) + "s";
    // Els retards negatius reparteixen les peces per la pantalla des del
    // primer moment, en lloc de fer-les caure totes juntes al començament.
    peca.style.animationDelay = (-aleatori(0, durada)).toFixed(1) + "s";
    if (pla.blur) peca.style.filter = "blur(" + pla.blur + "px)";

    const ala = document.createElement("span");
    ala.className = "drift__ala";
    ala.style.backgroundImage = formes[Math.floor(Math.random() * formes.length)];
    ala.style.setProperty("--rx", aleatori(40, 75).toFixed(0) + "deg");
    ala.style.setProperty("--ry", aleatori(-60, 60).toFixed(0) + "deg");
    ala.style.setProperty("--rz", aleatori(-180, 180).toFixed(0) + "deg");
    ala.style.animationDuration = aleatori(2.6, 5.2).toFixed(2) + "s";
    ala.style.animationDelay = (-aleatori(0, 5)).toFixed(2) + "s";

    peca.appendChild(ala);
    capa.appendChild(peca);
  }

  // Si l'usuari canvia de pestanya, aturem l'animació
  document.addEventListener("visibilitychange", function () {
    capa.classList.toggle("is-paused", document.hidden);
  });
})();
