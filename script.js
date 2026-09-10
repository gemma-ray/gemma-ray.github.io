/* ============================================================================
   GEMMA & RAY · 14 · 05 · 2027 · EL CONVENT DE BLANES
   script.js — tot el comportament del web, sense dependències externes
   ==========================================================================*/

/* ========================================
   CONFIGURACIÓ
   ⬇⬇⬇  AQUÍ ES CANVIA GAIREBÉ TOT  ⬇⬇⬇
   ======================================== */
const wedding = {
  couple: "Gemma & Ray",

  // Data i hora d'inici (format ISO amb zona horària de Catalunya).
  // Al maig, Catalunya és UTC+02:00.
  date: "2027-05-14T17:00:00+02:00",
  endDate: "2027-05-15T04:00:00+02:00",

  venue: "El Convent de Blanes",
  city: "Blanes",
  // Adreça completa: s'ensenya a la secció EL LLOC i es copia amb el botó
  address: "El Convent de Blanes, Camí del Convent s/n, 17300 Blanes, Girona",

  // Enllaç de Google Maps. Substituïu-lo pel del lloc real.
  mapsUrl: "https://maps.app.goo.gl/RgMQEUsR9MLXghAx5",

  hashtag: "#GemmaIRay",

  // Enllaç de la playlist de Spotify (o Apple Music, o el que vulgueu)
  spotifyUrl: "https://open.spotify.com/",

  // Àlbum compartit de fotos per als convidats (Google Photos, Dropbox…)
  photoAlbum: "",

  // Número de compte per als regals. Deixeu-lo buit fins que el vulgueu publicar.
  iban: "",

  rsvp: {
    // ── COM CONNECTAR EL FORMULARI ─────────────────────────────────────────
    // Deixeu "action" buit i el formulari funcionarà en mode demostració
    // (ensenya el missatge d'èxit però no envia res enlloc).
    //
    // Per rebre les respostes de veritat, creeu un formulari gratuït a
    // https://formspree.io i enganxeu aquí l'URL que us donin:
    //   action: "https://formspree.io/f/xxxxxxxx"
    //
    // També funciona amb Basin, Getform, Formsubmit o un Google Form
    // (vegeu el README).
    action: "",
    // "formspree" envia JSON i es queda a la pàgina.
    // "post" fa un enviament clàssic i marxa a la pàgina del servei.
    mode: "formspree"
  },

  // Data límit per confirmar assistència (només text informatiu)
  rsvpDeadline: "14 de març de 2027"
};

/* ========================================
   UTILITATS
   ======================================== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const isReduced = () => reduceMotion.matches;
const canHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const lerp = (a, b, t) => a + (b - a) * t;

/* Executa una funció de manera segura: si peta, no s'endú tot el web */
const safe = (label, fn) => {
  try { fn(); } catch (err) { console.warn(`[${label}]`, err); }
};

/* ========================================
   ENTRADA A LA PÀGINA
   Marca el web com a llest de seguida (sense preloader fals):
   altres seccions (deep-link, manuscrit) esperen aquest senyal.
   ======================================== */
safe("ready", () => {
  document.documentElement.classList.add("is-ready");
  window.dispatchEvent(new CustomEvent("wedding:ready"));
});

/* ========================================
   TEXT PARTIT EN PARAULES
   Embolcalla cada paraula perquè pugui pujar des de sota.
   ======================================== */
safe("split", () => {
  let counter = 0;

  const splitNode = (node, root) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = child.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
            return;
          }
          const wrap = document.createElement("span");
          wrap.className = "w";
          const inner = document.createElement("i");
          inner.style.setProperty("--i", counter++);
          inner.textContent = part;
          wrap.appendChild(inner);
          frag.appendChild(wrap);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        splitNode(child, root);
      }
    });
  };

  $$("[data-split]").forEach((el) => {
    counter = 0;
    splitNode(el, el);
    el.classList.add("split");
  });
});

/* ========================================
   REVELACIONS AL SCROLL
   ======================================== */
safe("reveal", () => {
  const targets = $$("[data-reveal], .split, .draw-on, .tl-item, .olive-branch--draw");
  if (!("IntersectionObserver" in window) || isReduced()) {
    targets.forEach((el) => el.classList.add("is-in"));
    return;
  }

  // Longitud real de cada traç, per a les il·lustracions que es dibuixen
  $$(".draw-on").forEach((svg) => {
    $$("path, line, circle, ellipse, polyline", svg).forEach((shape, i) => {
      const len = typeof shape.getTotalLength === "function" ? shape.getTotalLength() : 600;
      shape.style.setProperty("--len", Math.ceil(len) || 600);
      shape.style.setProperty("--i", i);
    });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      io.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });

  targets.forEach((el) => io.observe(el));
});

/* ========================================
   NAVEGACIÓ
   ======================================== */
safe("nav", () => {
  const nav = $("#nav");
  const burger = $("#burger");
  const menu = $("#menu");
  const links = $$(".nav__link");
  let lastY = window.scrollY;

  /* — Fons de la barra + amagar-la en baixar — */
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-stuck", y > 40);
    const goingDown = y > lastY && y > 500;
    nav.classList.toggle("is-hidden", goingDown && !menu.classList.contains("is-open"));
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* — Menú a pantalla completa — */
  let lastFocus = null;

  const openMenu = () => {
    lastFocus = document.activeElement;
    menu.hidden = false;
    // Un frame perquè l'animació de clip-path arrenqui bé
    requestAnimationFrame(() => menu.classList.add("is-open"));
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Tancar el menú");
    document.body.classList.add("is-locked");
    const first = $(".menu__item a", menu);
    if (first) setTimeout(() => first.focus(), 320);
  };

  const closeMenu = () => {
    menu.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Obrir el menú");
    document.body.classList.remove("is-locked");
    setTimeout(() => { menu.hidden = true; }, 700);
    if (lastFocus) lastFocus.focus();
  };

  burger.addEventListener("click", () => {
    menu.classList.contains("is-open") ? closeMenu() : openMenu();
  });

  $$("a", menu).forEach((a) => a.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) closeMenu();
  });

  /* — Enllaç actiu segons la secció visible — */
  const sections = links
    .map((a) => {
      const id = a.getAttribute("href");
      return id && id.startsWith("#") ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => {
          a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => spy.observe(s));
  }
});

/* ========================================
   DESPLAÇAMENT SUAU (per si el navegador no en té)
   ======================================== */
safe("smooth-scroll", () => {
  const supportsSmooth = "scrollBehavior" in document.documentElement.style;
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 10;
    if (supportsSmooth) {
      window.scrollTo({ top, behavior: isReduced() ? "auto" : "smooth" });
    } else {
      window.scrollTo(0, top);
    }
    // Manté l'URL neta però permet compartir seccions
    history.replaceState(null, "", id);
    // Accessibilitat: mou el focus a la secció
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
});

/* ========================================
   ENLLAÇOS COMPARTITS (…/#rsvp)
   Ho fem nosaltres quan el web ja està a punt, en lloc de deixar-ho al
   navegador: així el salt és fiable encara que el disseny trigui a
   assentar-se.
   ======================================== */
safe("deep-link", () => {
  const hash = window.location.hash;
  if (!hash || hash.length < 2) return;

  let target;
  try { target = document.querySelector(hash); } catch (e) { return; }
  if (!target) return;

  const go = () => {
    // Dos frames perquè el disseny ja estigui calculat
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const top = target.getBoundingClientRect().top + window.scrollY - 10;
      window.scrollTo({ top, behavior: "auto" });
    }));
  };

  if (document.documentElement.classList.contains("is-ready")) go();
  else window.addEventListener("wedding:ready", go, { once: true });
});

/* ========================================
   PROGRÉS DE LECTURA · TORNAR A DALT · SOL
   ======================================== */
safe("progress", () => {
  const bar = $("#progressBar");
  const toTop = $("#toTop");
  const ring = $(".to-top__ring");
  const sunTrack = $("#sunTrack");
  const sunBody = $("#sunBody");
  let ticking = false;

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;

    if (bar) bar.style.transform = `scaleX(${p})`;
    if (ring) ring.style.setProperty("--p", p.toFixed(3));
    if (toTop) toTop.classList.toggle("is-on", window.scrollY > window.innerHeight * 1.2);

    // El sol travessa el cel a mesura que avancem pel dia
    if (sunTrack && sunBody) {
      sunTrack.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.6);
      sunBody.style.top = `${lerp(8, 88, p)}%`;
    }
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener("resize", update);
  update();

  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: isReduced() ? "auto" : "smooth" });
    });
  }
});

/* ========================================
   AMBIENT · de la llum del migdia a la nit
   ======================================== */
safe("mood", () => {
  // Quin ambient té cada secció
  const moods = {
    inici: "",
    "compte-enrere": "sea",
    historia: "",
    "el-lloc": "dusk",
    "el-dia": "golden",
    cerimonia: "golden",
    aperitiu: "",
    sopar: "dusk",
    festa: "night",
    "com-arribar": "",
    allotjament: "",
    playlist: "dusk",
    postals: "",
    faq: "",
    rsvp: "sea",
    regals: "",
    final: ""
  };

  const root = document.documentElement;
  const setMood = (mood) => {
    root.classList.remove("mood-night", "mood-dusk", "mood-golden", "mood-sea");
    if (mood) root.classList.add(`mood-${mood}`);
  };

  if (!("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setMood(moods[entry.target.id] ?? "");
    });
  }, { rootMargin: "-48% 0px -48% 0px" });

  Object.keys(moods).forEach((id) => {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  });
});

/* ========================================
   COMPTE ENRERE
   ======================================== */
safe("countdown", () => {
  const root = $("#countdown");
  if (!root) return;

  const target = new Date(wedding.date).getTime();
  const out = {
    days: $('[data-cd="days"]', root),
    hours: $('[data-cd="hours"]', root),
    minutes: $('[data-cd="minutes"]', root),
    seconds: $('[data-cd="seconds"]', root)
  };
  const srText = $("#countdownText");
  const note = $(".countdown__note");
  const prev = {};

  const pad = (n) => String(n).padStart(2, "0");

  const render = () => {
    const diff = target - Date.now();

    if (diff <= 0) {
      Object.values(out).forEach((el) => el && (el.textContent = "00"));
      if (out.days) out.days.textContent = "00";
      if (note) note.textContent = "Avui és el dia. Ens veiem a El Convent de Blanes.";
      return true;
    }

    const s = Math.floor(diff / 1000);
    const values = {
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60
    };

    Object.entries(values).forEach(([key, value]) => {
      const el = out[key];
      if (!el) return;
      const text = key === "days" ? String(value) : pad(value);
      if (prev[key] === text) return;
      prev[key] = text;
      el.textContent = text;
      if (!isReduced()) {
        el.classList.remove("is-tick");
        void el.offsetWidth; // reinicia l'animació
        el.classList.add("is-tick");
      }
    });

    if (srText && values.seconds % 30 === 0) {
      srText.textContent = `Falten ${values.days} dies, ${values.hours} hores i ${values.minutes} minuts.`;
    }
    return false;
  };

  render();
  const timer = setInterval(() => { if (render()) clearInterval(timer); }, 1000);
});

/* ========================================
   MAR ANIMAT DEL HERO (canvas)
   Capes d'ones sinusoïdals en blaus mediterranis.
   ======================================== */
safe("sea", () => {
  const canvas = $("#seaCanvas");
  if (!canvas || isReduced()) return;

  const ctx = canvas.getContext("2d");

  /* ── LES CAPES ──────────────────────────────────────────────────────
     amp, len, speed i y són EXACTAMENT els de sempre: la forma, l'alçada
     i el moviment no canvien. L'únic que canvia és l'ompliment, que ara
     és un degradat de dues parades en lloc d'un color pla, perquè cada
     aiguada quedi més densa a la base, com la pintura que baixa i s'hi
     acumula. */
  const layers = [
    // rgb = el to de la capa; edge / body / pool = l'opacitat a la cresta,
    // just per dins, i al fons. Aquest és el perfil d'una aiguada: la vora
    // queda marcada perquè el pigment s'hi diposita, just per dins s'aclareix
    // i al fons torna a acumular-se.
    { amp: 10, len: 0.010, speed: 0.018, y: 0.30, rgb: "199, 213, 223", edge: 0.30, body: 0.18, pool: 0.44 },
    { amp: 14, len: 0.008, speed: 0.013, y: 0.46, rgb: "184, 203, 216", edge: 0.38, body: 0.24, pool: 0.52 },
    { amp: 18, len: 0.006, speed: 0.009, y: 0.62, rgb: "160, 183, 201", edge: 0.44, body: 0.28, pool: 0.60 },
    { amp: 12, len: 0.011, speed: 0.021, y: 0.78, rgb: "129, 158, 183", edge: 0.46, body: 0.30, pool: 0.64 },
    { amp: 16, len: 0.005, speed: 0.007, y: 0.92, rgb: "111, 145, 174", edge: 0.52, body: 0.34, pool: 0.74 }
  ];

  /* ── EL PIGMENT ──────────────────────────────────────────────────────
     Dues textures separades, perquè fan feines diferents:

       taques  — clapes irregulars, grans, on el pigment s'acumula més.
                 És el que treu la sensació de color pla.
       gra     — la trama del cotó, molt fina, per sota de tot.

     Les dues surten de filtres SVG de veritat (feTurbulence, un
     feDisplacementMap que only remena la textura per dins, i un
     feComponentTransfer que hi puja el contrast perquè les clapes es
     distingeixin en lloc de quedar en una grisor uniforme).

     Els filtres es resolen UNA vegada i es guarden com a imatge. Filtrar
     un canvas animat a cada fotograma vol dir recalcular la turbulència
     60 cops per segon i s'hi perd la fluïdesa. */
  const filtre = (freq, octaves, llavor, desplaça, pendent, tall) =>
    "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500">' +
      '<defs><filter id="f" x="0" y="0" width="100%" height="100%"' +
      ' color-interpolation-filters="sRGB">' +
      '<feTurbulence type="fractalNoise" baseFrequency="' + freq + '"' +
      ' numOctaves="' + octaves + '" seed="' + llavor + '" result="n"/>' +
      // remena la textura per dins; no toca cap silueta, és un mosaic
      '<feDisplacementMap in="n" in2="n" scale="' + desplaça + '"' +
      ' xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feColorMatrix in="d" type="saturate" values="0" result="g"/>' +
      // el contrast és el que fa que es vegin clapes i no una grisor plana
      '<feComponentTransfer>' +
      '<feFuncR type="linear" slope="' + pendent + '" intercept="' + tall + '"/>' +
      '<feFuncG type="linear" slope="' + pendent + '" intercept="' + tall + '"/>' +
      '<feFuncB type="linear" slope="' + pendent + '" intercept="' + tall + '"/>' +
      '<feFuncA type="linear" slope="0" intercept="1"/>' +
      '</feComponentTransfer></filter></defs>' +
      '<rect width="500" height="500" filter="url(#f)"/></svg>');

  /* Les clapes fortes de pigment feien les ones brutes i estranyes.
     Ens quedem només amb la trama fina del cotó, molt fluixa: prou perquè
     el color no sigui pla, però sense embrutar l'aiguada.
     EDIT HERE: si algun dia en voleu més, pugeu "alfa". */
  const textures = [
    { src: filtre("0.55", 2, 5, 4, 0.85, 0.08), escala: 1.0, alfa: 0.06, deriva: 1.0 }
  ];

  textures.forEach((tx) => {
    tx.img = new Image();
    tx.img.onload = () => { tx.llest = true; };
    tx.img.src = tx.src;
    tx.patro = null;
  });

  let w = 0, h = 0, dpr = 1, raf = null, t = 0, running = true;
  let grads = [];

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Els degradats es construeixen només aquí, no a cada fotograma
    grads = layers.map((layer) => {
      const g = ctx.createLinearGradient(0, h * layer.y - layer.amp, 0, h);
      g.addColorStop(0, `rgba(${layer.rgb}, ${layer.edge})`);
      g.addColorStop(0.16, `rgba(${layer.rgb}, ${layer.body})`);
      g.addColorStop(1, `rgba(${layer.rgb}, ${layer.pool})`);
      return g;
    });
    textures.forEach((tx) => { tx.patro = null; });
  };

  const wavePath = (layer, i, yOffset) => {
    ctx.beginPath();
    ctx.moveTo(0, h);
    const base = h * layer.y + yOffset;
    for (let x = 0; x <= w; x += 4) {
      const y = base
        + Math.sin(x * layer.len + t * layer.speed * 60 + i) * layer.amp
        + Math.sin(x * layer.len * 2.3 + t * layer.speed * 34) * (layer.amp * 0.35);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);

    layers.forEach((layer, i) => {
      /* L'aiguada, en tres passades. La vora no és un tall net de vector:
         hi passem dos traços tous just per sobre, com si el pigment
         s'hagués escampat una mica abans d'assentar-se. */
      wavePath(layer, i, -5);
      ctx.fillStyle = `rgba(${layer.rgb}, ${layer.edge * 0.3})`;
      ctx.fill();
      wavePath(layer, i, -2.5);
      ctx.fillStyle = `rgba(${layer.rgb}, ${layer.edge * 0.55})`;
      ctx.fill();
      wavePath(layer, i, 0);
      ctx.fillStyle = grads[i];
      ctx.fill();

      /* El pigment, retallat a la silueta de fora, perquè també entri a la
         vora escampada. Com que es pinta amb "source-atop", la seva força
         segueix l'opacitat del que hi ha a sota: fort al cos de l'ona i
         gairebé inexistent a la vora, que és el que fa una aquarel·la. */
      ctx.save();
      wavePath(layer, i, -5);
      ctx.clip();

      /* El pigment ha de viatjar AMB l'ona, no quedar-se enganxat a la
         pantalla. L'ona es desplaça horitzontalment a (speed*60/len)
         píxels per unitat de temps, així que movem la textura al mateix
         ritme. Cada textura amb una deriva lleugerament diferent, perquè
         les clapes i el gra no vagin en bloc. */
      const avanc = -(t * layer.speed * 60) / layer.len;

      ctx.globalCompositeOperation = "source-atop";
      textures.forEach((tx, k) => {
        if (!tx.llest) return;
        if (!tx.patro) tx.patro = ctx.createPattern(tx.img, "repeat");
        if (!tx.patro) return;
        if (tx.patro.setTransform && typeof DOMMatrix === "function") {
          try {
            tx.patro.setTransform(
              new DOMMatrix()
                .translateSelf(avanc * tx.deriva, i * 37 + k * 53)
                .scaleSelf(tx.escala, tx.escala)
            );
          } catch (e) { /* si no ho admet, la textura es queda quieta */ }
        }
        ctx.globalAlpha = tx.alfa;
        ctx.fillStyle = tx.patro;
        ctx.fillRect(0, 0, w, h);
      });

      ctx.restore();
    });

    t += 0.016;
    if (running) raf = requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener("resize", resize);

  // No gastem bateria quan el hero no es veu
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running && !raf) draw();
      if (!running && raf) { cancelAnimationFrame(raf); raf = null; }
    }, { threshold: 0.02 });
    io.observe(canvas);
  }

  /* Reflex del sol que segueix el ratolí */
  const hero = $(".hero");
  const reflection = $("#heroReflection");
  if (hero && reflection && canHover()) {
    hero.addEventListener("mousemove", (e) => {
      const pct = (e.clientX / window.innerWidth) * 100;
      reflection.style.setProperty("--mx", `${clamp(pct, 8, 92)}%`);
    });
  }
});

/* ========================================
   ESTELS DE LA FESTA (canvas)
   ======================================== */
safe("stars", () => {
  const canvas = $("#starCanvas");
  if (!canvas || isReduced()) return;

  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, dpr = 1, stars = [], raf = null, running = false;
  let shooting = null, nextShot = 3000, last = performance.now();

  const build = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round((w * h) / 9000);
    stars = Array.from({ length: clamp(count, 40, 220) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.3 + 0.3,
      a: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.0018 + 0.0006,
      phase: Math.random() * Math.PI * 2
    }));
  };

  const draw = (now) => {
    const dt = now - last;
    last = now;
    ctx.clearRect(0, 0, w, h);

    stars.forEach((s) => {
      const twinkle = s.a + Math.sin(now * s.speed + s.phase) * 0.28;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(251, 246, 238, ${clamp(twinkle, 0.05, 0.95)})`;
      ctx.fill();
    });

    // Un estel fugaç de tant en tant — pot demanar-se un desig
    nextShot -= dt;
    if (!shooting && nextShot <= 0) {
      shooting = {
        x: Math.random() * w * 0.6,
        y: Math.random() * h * 0.4,
        len: 0,
        max: Math.random() * 160 + 90,
        speed: Math.random() * 0.5 + 0.45
      };
      nextShot = Math.random() * 9000 + 5000;
    }
    if (shooting) {
      shooting.len += shooting.speed * dt;
      const { x, y, len, max } = shooting;
      const grad = ctx.createLinearGradient(x, y, x + len, y + len * 0.4);
      grad.addColorStop(0, "rgba(251, 246, 238, 0)");
      grad.addColorStop(1, "rgba(251, 246, 238, 0.85)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len, y + len * 0.4);
      ctx.stroke();
      if (len > max) shooting = null;
    }

    if (running) raf = requestAnimationFrame(draw);
  };

  build();
  window.addEventListener("resize", build);

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running && !raf) { last = performance.now(); raf = requestAnimationFrame(draw); }
      if (!running && raf) { cancelAnimationFrame(raf); raf = null; }
    }, { threshold: 0.02 });
    io.observe(canvas);
  }
});

/* ========================================
   PARAL·LAXI
   ======================================== */
safe("parallax", () => {
  const items = $$("[data-parallax]");
  if (!items.length || isReduced()) return;

  let ticking = false;
  const update = () => {
    const vh = window.innerHeight;
    items.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > vh + 200) return;
      const speed = parseFloat(el.dataset.parallax) || 0.05;
      const offset = (rect.top + rect.height / 2 - vh / 2) * speed;
      el.style.transform = `translate3d(0, ${(-offset).toFixed(2)}px, 0)`;
    });
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
});

/* ========================================
   TIMELINE · la línia s'omple mentre baixes
   ======================================== */
safe("timeline", () => {
  const spine = $(".timeline");
  const fill = $("#timelineFill");
  if (!spine || !fill) return;

  let ticking = false;
  const update = () => {
    const rect = spine.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height;
    const scrolled = clamp((vh * 0.55 - rect.top) / total, 0, 1);
    fill.style.setProperty("--fill", `${(scrolled * 100).toFixed(1)}%`);
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
});

/* ========================================
   ACORDIÓ DE PREGUNTES
   ======================================== */
safe("accordion", () => {
  $$(".acc__btn").forEach((btn) => {
    const panel = btn.parentElement.nextElementSibling;
    if (!panel) return;

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      // Només una oberta alhora: queda més net
      $$(".acc__btn").forEach((other) => {
        if (other === btn) return;
        other.setAttribute("aria-expanded", "false");
        const otherPanel = other.parentElement.nextElementSibling;
        if (otherPanel) otherPanel.dataset.open = "false";
      });

      btn.setAttribute("aria-expanded", String(!isOpen));
      panel.dataset.open = String(!isOpen);
    });
  });
});

/* ========================================
   POSTALS ARROSSEGABLES
   ======================================== */
safe("postcards", () => {
  const stage = $("#postcardStage");
  if (!stage) return;

  const cards = $$(".postcard", stage);
  let z = 10;

  const place = () => {
    cards.forEach((card) => {
      const x = card.style.getPropertyValue("--x") || "0%";
      const y = card.style.getPropertyValue("--y") || "0%";
      const r = card.style.getPropertyValue("--r") || "0deg";
      card.style.left = x;
      card.style.top = y;
      card.style.transform = `rotate(${r})`;
      card.style.zIndex = ++z;
    });
  };
  place();

  cards.forEach((card) => {
    let startX = 0, startY = 0, originX = 0, originY = 0, dragging = false;
    const rotation = card.style.getPropertyValue("--r") || "0deg";

    const down = (e) => {
      dragging = true;
      card.classList.add("is-dragging");
      card.style.zIndex = ++z;
      card.setPointerCapture?.(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      originX = card.offsetLeft;
      originY = card.offsetTop;
    };

    const move = (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const maxX = stage.clientWidth - card.offsetWidth;
      const maxY = stage.clientHeight - card.offsetHeight;
      card.style.left = `${clamp(originX + dx, -20, maxX + 20)}px`;
      card.style.top = `${clamp(originY + dy, -20, maxY + 20)}px`;
      // Petit gir segons la velocitat, com una carta llançada
      card.style.transform = `rotate(calc(${rotation} + ${clamp(dx * 0.03, -8, 8)}deg))`;
    };

    const up = (e) => {
      if (!dragging) return;
      dragging = false;
      card.classList.remove("is-dragging");
      card.releasePointerCapture?.(e.pointerId);
      card.style.transform = `rotate(${rotation})`;
    };

    card.addEventListener("pointerdown", down);
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerup", up);
    card.addEventListener("pointercancel", up);
  });

  window.addEventListener("resize", () => {
    // Si canvia la mida de la pantalla, tornem a col·locar-les
    if (window.innerWidth < 900) place();
  });
});

/* ========================================
   INCLINACIÓ 3D SUAU
   ======================================== */
safe("tilt", () => {
  if (!canHover() || isReduced()) return;

  $$(".tilt").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * 12}deg) rotateX(${-py * 12}deg) translateZ(0)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
    });
  });
});

/* ========================================
   CURSOR PERSONALITZAT (escriptori)
   ======================================== */
safe("cursor", () => {
  const cursor = $("#cursor");
  const label = $("#cursorLabel");
  if (!cursor || !canHover() || isReduced()) return;

  /* La icona del punter la posa el CSS amb la propietat "cursor", que va
     sempre clavada i sense retard. L'única cosa que queda per fer aquí és
     acompanyar el ratolí amb l'etiqueta ("Veure", "Arrossega"…). */
  document.documentElement.classList.add("has-cursor");

  const anchor = $(".cursor__ring", cursor);
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!cursor.classList.contains("is-awake")) {
      rx = mx; ry = my;
      cursor.classList.add("is-awake");
    }
  });
  document.addEventListener("mouseleave", () => { cursor.style.opacity = "0"; });
  document.addEventListener("mouseenter", () => { cursor.style.opacity = ""; });

  const render = () => {
    rx = lerp(rx, mx, 0.3);
    ry = lerp(ry, my, 0.3);
    if (anchor) anchor.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(render);
  };
  render();

  /* Els llocs que expliquen què s'hi pot fer */
  const labels = [
    [".gal", "Veure"],
    [".postcard", "Arrossega"],
    [".flip", "Gira-la"],
    [".vinyl", "Fes-lo girar"],
    [".hscroll", "Arrossega"],
    ["#coupleName", "Clica'ns"]
  ];

  labels.forEach(([sel, text]) => {
    $$(sel).forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("is-label");
        if (label) label.textContent = text;
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("is-label");
        if (label) label.textContent = "";
      });
    });
  });
});

/* ========================================
   SO AMBIENT DEL MAR
   Es genera amb Web Audio: cap fitxer d'àudio, cap descàrrega.
   SEMPRE comença apagat. Només sona si l'usuari ho demana.
   ======================================== */
safe("sound", () => {
  const toggle = $("#soundToggle");
  if (!toggle) return;

  let ctx = null, master = null, playing = false, timer = null;

  const build = () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return false;
    ctx = new AudioCtx();

    // Soroll rosa com a base de l'onatge
    const seconds = 4;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.0990460;
      b1 = 0.96300 * b1 + white * 0.2965164;
      b2 = 0.57000 * b2 + white * 1.0526913;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.09;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Filtre que s'obre i es tanca: simula les onades trencant
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 520;
    filter.Q.value = 0.7;

    master = ctx.createGain();
    master.gain.value = 0;

    source.connect(filter).connect(master).connect(ctx.destination);
    source.start();

    // Cada onada: puja i baixa el volum i el filtre
    const wave = () => {
      if (!ctx || !playing) return;
      const now = ctx.currentTime;
      const peak = 0.16 + Math.random() * 0.09;
      const rise = 1.6 + Math.random() * 1.4;
      const fall = 2.4 + Math.random() * 1.8;

      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(peak, now + rise);
      master.gain.linearRampToValueAtTime(0.045, now + rise + fall);

      filter.frequency.cancelScheduledValues(now);
      filter.frequency.setValueAtTime(filter.frequency.value, now);
      filter.frequency.linearRampToValueAtTime(1100 + Math.random() * 500, now + rise);
      filter.frequency.linearRampToValueAtTime(420, now + rise + fall);

      timer = setTimeout(wave, (rise + fall) * 1000);
    };

    toggle._wave = wave;
    return true;
  };

  const start = async () => {
    if (!ctx && !build()) return;
    if (ctx.state === "suspended") await ctx.resume();
    playing = true;
    toggle._wave();
    toggle.setAttribute("aria-pressed", "true");
    toggle.setAttribute("aria-label", "Desactivar el so ambient del mar");
  };

  const stop = () => {
    playing = false;
    clearTimeout(timer);
    if (master && ctx) {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.8);
    }
    toggle.setAttribute("aria-pressed", "false");
    toggle.setAttribute("aria-label", "Activar el so ambient del mar");
  };

  toggle.addEventListener("click", () => (playing ? stop() : start()));

  // Si l'usuari canvia de pestanya, callem
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && playing) stop();
  });
});

/* ========================================
   FORMULARI RSVP
   ======================================== */
safe("rsvp", () => {
  const form = $("#rsvpForm");
  const success = $("#rsvpSuccess");
  const successText = $("#rsvpSuccessText");
  const submit = $("#rsvpSubmit");
  const again = $("#rsvpAgain");
  const details = $("#rsvpDetails");
  if (!form) return;

  if (wedding.rsvp.action) form.setAttribute("action", wedding.rsvp.action);

  /* — Comptador d'acompanyants — */
  const input = $("#acompanyants");
  $$("[data-step]", form).forEach((btn) => {
    btn.addEventListener("click", () => {
      const step = parseInt(btn.dataset.step, 10);
      const next = clamp((parseInt(input.value, 10) || 0) + step, 0, 10);
      input.value = next;
      if (!isReduced()) {
        input.animate(
          [{ transform: "translateY(-6px)", opacity: 0.4 }, { transform: "none", opacity: 1 }],
          { duration: 320, easing: "cubic-bezier(.22,1,.36,1)" }
        );
      }
    });
  });

  /* — Si algú diu que no pot venir, amaguem els detalls — */
  $$('input[name="assistencia"]', form).forEach((radio) => {
    radio.addEventListener("change", () => {
      const coming = $("#ve-si").checked;
      if (details) details.style.display = coming ? "grid" : "none";
      if (successText) {
        successText.textContent = coming
          ? `Ja estàs a la llista. Ens veiem el 14 de maig de 2027 a ${wedding.venue}.`
          : "Gràcies per dir-nos-ho. Ens sabrà molt de greu no tenir-te allà, però ho entenem. Ens prendrem una copa a la teva salut.";
      }
    });
  });

  /* — Validació — */
  const setError = (field, on) => field.closest(".field, fieldset").classList.toggle("is-error", on);

  const validate = () => {
    let ok = true;

    const nom = $("#nom");
    const nomOk = nom.value.trim().length >= 2;
    setError(nom, !nomOk);
    if (!nomOk) ok = false;

    const email = $("#email");
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
    setError(email, !emailOk);
    if (!emailOk) ok = false;

    const answered = $$('input[name="assistencia"]', form).some((r) => r.checked);
    const fieldset = $('input[name="assistencia"]', form).closest("fieldset");
    fieldset.classList.toggle("is-error", !answered);
    if (!answered) ok = false;

    if (!ok) {
      const firstError = $(".is-error", form);
      if (firstError) {
        firstError.scrollIntoView({ behavior: isReduced() ? "auto" : "smooth", block: "center" });
        const focusable = $("input, select, textarea", firstError);
        if (focusable) focusable.focus({ preventScroll: true });
      }
    }
    return ok;
  };

  const showSuccess = () => {
    form.style.display = "none";
    if (success) success.classList.add("is-on");
    dropConfetti();
    success?.scrollIntoView({ behavior: isReduced() ? "auto" : "smooth", block: "center" });
  };

  form.addEventListener("submit", async (e) => {
    // Trampa antispam
    if ($("#website").value) { e.preventDefault(); return; }

    if (!validate()) { e.preventDefault(); return; }

    // Sense servei configurat → mode demostració
    if (!wedding.rsvp.action) {
      e.preventDefault();
      console.info(
        "[RSVP] Mode demostració: encara no hi ha cap servei configurat.\n" +
        "Poseu l'URL del vostre formulari a script.js → wedding.rsvp.action.\n" +
        "Dades que s'haurien enviat:",
        Object.fromEntries(new FormData(form))
      );
      showSuccess();
      return;
    }

    // Enviament sense sortir de la pàgina (Formspree i companyia)
    if (wedding.rsvp.mode === "formspree") {
      e.preventDefault();
      submit.disabled = true;
      submit.textContent = "Enviant…";
      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        showSuccess();
      } catch (err) {
        console.error("[RSVP]", err);
        submit.disabled = false;
        submit.textContent = "Tornar-ho a provar";
        toast("No s'ha pogut enviar. Torna-ho a provar, si us plau.");
      }
      return;
    }
    // mode "post": deixem que el navegador enviï el formulari com sempre
  });

  if (again) {
    again.addEventListener("click", () => {
      form.reset();
      if (details) details.style.display = "grid";
      $$(".is-error", form).forEach((el) => el.classList.remove("is-error"));
      success.classList.remove("is-on");
      form.style.display = "grid";
      submit.disabled = false;
      submit.textContent = "Enviar confirmació";
      $("#nom").focus();
    });
  }
});

/* ========================================
   AFEGIR AL CALENDARI (.ics generat al navegador)
   ======================================== */
function downloadICS() {
  const toICS = (iso) =>
    new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gemma i Ray//Casament 2027//CA",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:gemma-ray-2027@${location.hostname || "casament"}`,
    `DTSTAMP:${toICS(new Date().toISOString())}`,
    `DTSTART:${toICS(wedding.date)}`,
    `DTEND:${toICS(wedding.endDate)}`,
    `SUMMARY:Casament de ${wedding.couple}`,
    `LOCATION:${wedding.address.replace(/,/g, "\\,")}`,
    `DESCRIPTION:Ens casem! Us hi esperem a ${wedding.venue}\\, ${wedding.city}.`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Demà es casen la Gemma i en Ray",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gemma-ray-14-05-2027.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Guardat al calendari");
}

/* ========================================
   AVISOS I COPIAR AL PORTA-RETALLS
   ======================================== */
let toastTimer = null;
function toast(message) {
  const el = $("#copyToast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-on"), 2600);
}

async function copyText(text, message) {
  try {
    await navigator.clipboard.writeText(text);
    toast(message);
  } catch (err) {
    // Navegadors antics o sense permisos
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); toast(message); }
    catch (e) { toast("No s'ha pogut copiar"); }
    ta.remove();
  }
}

safe("actions", () => {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    switch (btn.dataset.action) {
      case "ics":
        downloadICS();
        break;
      case "copy-address":
        copyText(wedding.address, "Adreça copiada");
        break;
      case "copy-hashtag":
        copyText(wedding.hashtag, "Etiqueta copiada");
        break;
      case "copy-iban":
        copyText(($("#giftIban")?.textContent || "").trim(), "Número de compte copiat");
        break;
    }
  });
});

/* ========================================
   CONFETI DE FULLES D'OLIVERA
   ======================================== */
function dropConfetti(amount = 46) {
  const layer = $("#confetti");
  if (!layer || isReduced()) return;

  const colors = ["#6e7b52", "#97a37c", "#c26f4a", "#0f4c9c", "#7ba5c8", "#ecdfc9"];

  for (let i = 0; i < amount; i++) {
    const leaf = document.createElement("span");
    leaf.className = "leaf";
    leaf.style.background = colors[Math.floor(Math.random() * colors.length)];
    leaf.style.left = `${Math.random() * 100}%`;
    leaf.style.top = "-6%";
    leaf.style.opacity = String(0.55 + Math.random() * 0.45);

    const scale = 0.6 + Math.random() * 1.1;
    const drift = (Math.random() - 0.5) * 320;
    const spin = (Math.random() - 0.5) * 900;
    const duration = 3200 + Math.random() * 2600;

    layer.appendChild(leaf);

    const anim = leaf.animate(
      [
        { transform: `translate(0, 0) rotate(0deg) scale(${scale})`, opacity: 1 },
        { transform: `translate(${drift * 0.5}px, 45vh) rotate(${spin * 0.5}deg) scale(${scale})`, opacity: 1 },
        { transform: `translate(${drift}px, 108vh) rotate(${spin}deg) scale(${scale})`, opacity: 0 }
      ],
      { duration, delay: Math.random() * 900, easing: "cubic-bezier(.32,.12,.42,1)" }
    );
    anim.onfinish = () => leaf.remove();
  }
}

/* ========================================
   OU DE PASQUA · clica els noms set vegades
   ======================================== */
safe("easter-egg", () => {
  const name = $("#coupleName");
  const egg = $("#egg");
  const close = $("#eggClose");
  if (!name || !egg) return;

  let clicks = 0;
  let resetTimer = null;

  name.addEventListener("click", () => {
    clicks += 1;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { clicks = 0; }, 2200);

    if (!isReduced()) {
      name.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.03)" }, { transform: "scale(1)" }],
        { duration: 340, easing: "cubic-bezier(.22,1,.36,1)" }
      );
    }

    if (clicks === 4) toast("Tres més…");

    if (clicks >= 7) {
      clicks = 0;
      egg.hidden = false;
      requestAnimationFrame(() => egg.classList.add("is-on"));
      document.body.classList.add("is-locked");
      dropConfetti(70);
      close.focus();
    }
  });

  const hide = () => {
    egg.classList.remove("is-on");
    document.body.classList.remove("is-locked");
    setTimeout(() => { egg.hidden = true; }, 700);
  };

  close.addEventListener("click", hide);
  egg.addEventListener("click", (e) => { if (e.target === egg) hide(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !egg.hidden) hide();
  });
});

/* ========================================
   VINIL DE LA PLAYLIST
   ======================================== */
safe("vinyl", () => {
  const vinyl = $("#vinyl");
  if (!vinyl) return;
  vinyl.addEventListener("click", () => {
    const on = vinyl.classList.toggle("is-spinning");
    vinyl.setAttribute("aria-pressed", String(on));
  });
});

/* ========================================
   ENLLAÇOS I TEXTOS QUE VENEN DE LA CONFIGURACIÓ
   ======================================== */
safe("bind-config", () => {
  const set = (sel, fn) => { const el = $(sel); if (el) fn(el); };

  set("#mapsLink", (el) => { el.href = wedding.mapsUrl; });
  set("#venueAddress", (el) => { el.textContent = wedding.address; });
  set("#hashtagBig", (el) => { el.textContent = wedding.hashtag; });

  set("#spotifyLink", (el) => {
    if (wedding.spotifyUrl) el.href = wedding.spotifyUrl;
    else { el.removeAttribute("href"); el.setAttribute("aria-disabled", "true"); el.textContent = "Playlist ben aviat"; }
  });

  set("#photoAlbumLink", (el) => {
    if (wedding.photoAlbum) {
      el.href = wedding.photoAlbum;
    } else {
      el.removeAttribute("href");
      el.removeAttribute("target");
      el.textContent = "Enllaç disponible el 14 de maig";
      el.style.opacity = "0.6";
    }
  });

  set("#giftIban", (el) => {
    if (wedding.iban) el.textContent = wedding.iban;
  });

  // Les etiquetes del peu i del menú també segueixen la configuració
  $$(".menu__foot span, .footer__credit").forEach((el) => {
    el.innerHTML = el.innerHTML.replace(/#GemmaIRay/g, wedding.hashtag);
  });

  // Títol de la pestanya quan es marxa i es torna
  const original = document.title;
  document.addEventListener("visibilitychange", () => {
    document.title = document.hidden ? "Ei, torna! · Gemma & Ray" : original;
  });
});

/* ========================================
   Nota per a qui obri la consola
   ======================================== */
console.log(
  "%cGemma & Ray · 14 · 05 · 2027",
  "font-size:15px;font-family:Georgia,serif;color:#0f4c9c;letter-spacing:.08em"
);
console.log(
  "%cEl Convent de Blanes · Costa Brava\nSi has arribat fins aquí, prova de clicar els nostres noms set vegades.",
  "color:#6e7b52;font-family:system-ui;font-size:11px"
);


