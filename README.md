# Gemma &amp; Ray · 14 · 05 · 2027

Web del casament de la Gemma i en Ray a **El Convent de Blanes**, Costa Brava.

HTML, CSS i JavaScript purs. Sense servidor, sense base de dades, sense procés de
compilació i sense dependències que calgui instal·lar. Es puja a GitHub, s'activa
GitHub Pages i ja està en línia.

---

## Índex

1. [Estructura del projecte](#estructura-del-projecte)
2. [Veure'l en local](#veure-l-en-local)
3. [La pàgina d'entrada (contrasenya)](#la-pàgina-dentrada-contrasenya)
4. [Canviar la informació del casament](#canviar-la-informació-del-casament)
5. [Substituir les fotos](#substituir-les-fotos)
6. [Configurar el formulari RSVP](#configurar-el-formulari-rsvp)
7. [Publicar-lo amb GitHub Pages](#publicar-lo-amb-github-pages)
8. [Afegir o treure seccions](#afegir-o-treure-seccions)
9. [Accessibilitat i rendiment](#accessibilitat-i-rendiment)

---

## Estructura del projecte

```
/
├── index.html          LA PÀGINA D'ENTRADA (demana la contrasenya)
├── login.js            La contrasenya i la comprovació. Res més.
│
├── casament.html       EL WEB DEL CASAMENT: totes les seccions i els textos
├── script.js           Tot el comportament del web. La configuració és a dalt.
├── styles.css          Els estils de les dues pàgines, per seccions numerades
│
├── robots.txt          Perquè el web no surti als cercadors
├── .nojekyll           Evita que GitHub Pages processi res pel seu compte
├── README.md           Aquest fitxer
└── assets/
    ├── images/         Aquí van les fotos (ara hi ha degradats fets amb CSS)
    │   └── README.md   Instruccions per substituir cada foto
    └── icons/
        └── favicon.svg Icona de la pestanya
```

### Com encaixen les dues pàgines

```
        index.html                     casament.html
   ┌────────────────────┐         ┌─────────────────────┐
   │  paraula correcta  │  ────>  │  el web sencer      │
   └────────────────────┘         └─────────────────────┘
            ^                                │
            └──────────  si no s'ha entrat  ─┘
```

`index.html` només demana la paraula. Si és correcta, deixa una marca al
navegador i porta a `casament.html`. I `casament.html`, abans de pintar res,
comprova aquesta marca: si no hi és, torna a `index.html`.

Els que ja han entrat abans no han de tornar a escriure res: `index.html`
els envia directament al casament.

Fitxers que caldrà tocar: **`casament.html`** (els textos), **`script.js`**
(la configuració), **`login.js`** (la contrasenya) i **`assets/images/`** (les fotos).

Dins de `casament.html` i `styles.css` hi ha comentaris ben visibles marcant els
punts editables:

```html
<!-- EDIT HERE: horaris del dia -->
```

```css
/* ========================================
   13. EL DIA · TIMELINE
   ======================================== */
```

---

## Veure'l en local

**Opció A — obrir el fitxer directament.** Feu doble clic a `index.html` (la pàgina d'entrada).
Funciona tot excepte alguna cosa menor de seguretat del navegador.

**Opció B — servidor estàtic (recomanada).** Des de la carpeta del projecte:

```bash
# Amb Python (ja el teniu instal·lat al Mac)
python3 -m http.server 8000

# O amb Node
npx serve .
```

I obriu <http://localhost:8000>.

> No cal instal·lar res més. No hi ha `npm install`, ni `build`, ni `dist`.

---

## La pàgina d'entrada (contrasenya)

`index.html` és una pàgina a part que només demana una paraula. El web del
casament viu a `casament.html`, i no s'hi arriba sense passar per aquí.

La contrasenya actual és **`gemmairay`**. No distingeix majúscules ni espais
sobrants, així que `Gemmairay` o ` GEMMAIRAY ` també funcionen: ningú no es
quedarà fora per una lletra gran.

Un cop dins, el navegador ho recorda **120 dies**, de manera que els convidats
només l'hauran d'escriure un cop per dispositiu.

### ⚠️ Això no és seguretat de veritat

Aquest web és estàtic: no hi ha servidor, i per tant la comprovació de la
contrasenya es fa **dins del navegador**. Qui tingui una mica de coneixement
tècnic pot obrir el codi font i trobar-la, o anar directament a
`casament.html` i saltar-se la comprovació.

Serveix per **evitar visites casuals** i perquè el web no circuli fora del
cercle de convidats. **No hi poseu mai res sensible al darrere**: ni números de
compte reals, ni adreces privades, ni dades de tercers.

Perquè tampoc no aparegui als cercadors, hi ha un `robots.txt` i una etiqueta
`<meta name="robots" content="noindex">` a les dues pàgines.

Si algun dia necessiteu privacitat de debò, cal un servei amb servidor
(Netlify, per exemple, porta protecció per contrasenya integrada). Amb GitHub
Pages i un web estàtic no és possible.

### Canviar la contrasenya

No es guarda en clar, sinó com una empremta, per si algú tafaneja el codi.
Per canviar-la:

1. Obriu la pàgina d'entrada i, tot seguit, la consola del navegador
   (Chrome: ⌥⌘J · Safari: cal activar abans el menú Desenvolupament).
2. Escriviu-hi:

   ```js
   grHash("la-nova-paraula")
   ```

3. Copieu el resultat i enganxeu-lo a **`login.js`**:

   ```js
   const login = {
     hash: "aquí-el-resultat",
     destination: "./casament.html",
     rememberDays: 120,
     enabled: true
   };
   ```

### Treure la contrasenya i obrir el web a tothom

A `login.js`, canvieu una sola línia:

```js
enabled: false   // la pàgina d'entrada passarà de llarg
```

També podeu esborrar el `robots.txt` i les etiquetes `<meta name="robots">`
si voleu que el web sigui indexable.

### Tornar a veure la pàgina d'entrada mentre proveu coses

Com que el navegador recorda que ja heu entrat, per tornar-la a veure
escriviu això a la consola i recarregueu:

```js
localStorage.removeItem("gr-entrada"); location.reload();
```

---

## Canviar la informació del casament

Obriu **`script.js`**. Les primeres 60 línies són l'objecte de configuració:

```js
const wedding = {
  couple: "Gemma & Ray",
  date: "2027-05-14T16:30:00+02:00",   // inici (compte enrere i calendari)
  endDate: "2027-05-15T04:00:00+02:00",// final (només per al calendari)
  venue: "El Convent de Blanes",
  city: "Blanes",
  address: "El Convent de Blanes, Camí del Convent s/n, 17300 Blanes, Girona",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=El+Convent+de+Blanes",
  hashtag: "#GemmaIRay",
  spotifyUrl: "https://open.spotify.com/",
  photoAlbum: "",   // àlbum compartit de fotos; buit = "disponible el 14 de maig"
  iban: "",         // compte per als regals; buit = manté el text de mostra
  rsvp: { action: "", mode: "formspree" },
  rsvpDeadline: "14 de març de 2027"
};
```

Aquests valors alimenten automàticament el compte enrere, el botó *Afegeix-ho al
calendari*, l'enllaç de Google Maps, el botó de copiar l'adreça, l'etiqueta i els
enllaços de Spotify i de l'àlbum de fotos.

**La resta de textos són a `casament.html`**, escrits directament en català perquè
els pugueu llegir i canviar sense buscar-los enlloc més. Cerqueu `EDIT HERE`
per trobar els blocs més habituals:

| Què voleu canviar | On és |
|---|---|
| La història de la parella | secció `03 · LA NOSTRA HISTÒRIA` |
| Els horaris del dia | secció `06 · EL DIA · TIMELINE` |
| El dress code i la paleta | secció `11 · DRESS CODE` |
| Els horaris dels autocars | secció `13 · TRANSPORT` |
| Els hotels i els codis de reserva | secció `14 · ON DORMIR` |
| Els llocs de Blanes | secció `16 · QUÈ FER A BLANES` |
| Les cançons | secció `19 · PLAYLIST` |
| Les preguntes freqüents | secció `23 · PREGUNTES FREQÜENTS` |
| El text dels regals | secció `25 · REGALS` |
| Les dades del temps | secció `27 · EL TEMPS` |

---

## Substituir les fotos

Ara mateix totes les imatges són **composicions de degradat generades amb CSS**.
Això vol dir que el web mai es veurà trencat i que no depèn de cap URL externa
que pugui desaparèixer.

Per posar una foto real, deseu-la a `assets/images/` i afegiu la variable `--img`
a l'element corresponent:

```html
<!-- Abans -->
<div class="frame frame--tall ph-stone"></div>

<!-- Després -->
<div class="frame frame--tall ph-stone"
     style="--img:url('assets/images/historia-01.jpg')"></div>
```

Deixar-hi la classe `ph-*` és bona idea: el degradat es veurà mentre la foto
carrega. Teniu la taula completa de fitxers recomanats a
[`assets/images/README.md`](assets/images/README.md).

Les seccions amb foto de fons a pantalla completa (**El lloc** i **La Costa
Brava**) funcionen igual:

```html
<div class="venue__bg" data-parallax="0.12"
     style="--img:url('assets/images/convent.jpg')"></div>
```

---

## Configurar el formulari RSVP

El formulari és HTML pur i **no necessita servidor**. De sèrie funciona en *mode
demostració*: valida els camps, ensenya el missatge d'èxit i llança el confeti,
però no envia res enlloc (les dades es veuen a la consola del navegador).

### Amb Formspree (el més senzill, gratuït fins a 50 respostes/mes)

1. Creeu un compte a <https://formspree.io> i un formulari nou.
2. Copieu l'URL que us donen, de l'estil `https://formspree.io/f/abcdwxyz`.
3. A `script.js`:

```js
rsvp: {
  action: "https://formspree.io/f/abcdwxyz",
  mode: "formspree"    // envia en segon pla i es queda a la pàgina
}
```

Rebreu cada confirmació per correu i les podreu exportar a CSV.

### Amb un altre servei (Basin, Getform, Formsubmit…)

Igual que a dalt: enganxeu l'URL a `action`. Si el servei no accepta enviaments
per `fetch`, poseu `mode: "post"` i el navegador farà l'enviament clàssic.

### Amb un formulari de Google

1. Creeu el formulari amb els mateixos camps.
2. Obriu-lo, feu clic dret → *Inspecciona* i copieu l'URL d'acció
   (`https://docs.google.com/forms/d/e/…/formResponse`) i el `name`
   de cada camp (`entry.123456789`).
3. Poseu l'URL a `action`, `mode: "post"`, i canvieu l'atribut `name` de cada
   `input` de `casament.html` pel seu `entry.…` corresponent.

### Camps que recull

Nom i cognoms · correu · vindràs? · nombre d'acompanyants · noms dels
acompanyants · restriccions alimentàries · transport · cançó · missatge per als
nuvis. Hi ha una trampa antispam invisible (`_gotcha`) que els serveis
habituals reconeixen.

---

## Publicar-lo amb GitHub Pages

El projecte ja està preparat: **totes les rutes són relatives**, així que
funciona igual de bé a `usuari.github.io/repositori/` que a un domini propi.

### Passos exactes

1. **Pugeu el codi** (si encara no ho heu fet):

   ```bash
   cd gemma-ray-wedding
   git init
   git add .
   git commit -m "Web del casament de la Gemma i en Ray"
   git branch -M main
   git remote add origin https://github.com/USUARI/gemma-ray-wedding.git
   git push -u origin main
   ```

2. **Activeu Pages**: aneu al repositori a GitHub →
   pestanya **Settings** → menú lateral **Pages**.

3. A **Build and deployment → Source**, trieu **Deploy from a branch**.

4. A **Branch**, trieu **`main`** i la carpeta **`/ (root)`**. Premeu **Save**.

5. Espereu un o dos minuts. La pàgina de Settings → Pages us ensenyarà l'enllaç:

   ```
   https://USUARI.github.io/gemma-ray-wedding/
   ```

### Per fer canvis després

Editeu el fitxer, deseu i:

```bash
git add .
git commit -m "Actualitzo els horaris dels autocars"
git push
```

En menys d'un minut el canvi ja és en línia. També podeu editar qualsevol fitxer
directament des de la web de GitHub (icona del llapis) si no voleu tocar la
terminal.

### Domini propi (opcional)

Si compreu un domini tipus `gemmairay.com`:

1. Settings → Pages → **Custom domain**, escriviu-hi el domini i deseu.
2. Al proveïdor del domini, creeu un registre `CNAME` cap a
   `USUARI.github.io`.
3. Marqueu **Enforce HTTPS** quan s'activi.

---

## Afegir o treure seccions

Cada secció de `casament.html` està separada per una capçalera numerada i és
completament independent. Per treure'n una:

1. Esborreu el bloc `<section>…</section>` sencer de `casament.html`.
2. Si surt al menú, esborreu també la seva línia de `.nav__links` i `.menu__list`.

No cal tocar `styles.css` ni `script.js`: tot el JavaScript comprova que
l'element existeixi abans de fer res, i cada bloc va dins d'una funció `safe()`
que aïlla els errors. Si una part falla, la resta del web continua funcionant.

Les seccions actuals, per ordre: hero · compte enrere · la nostra història ·
ens casem · el lloc · el dia · cerimònia · aperitiu · sopar · la festa ·
dress code · com arribar-hi · transport · on dormir · el cap de setmana ·
què fer a Blanes · la Costa Brava · menjar &amp; beure · playlist · fotos ·
postals · petites coses · preguntes freqüents · RSVP · regals · lluna de mel ·
el temps · hashtag · comparteix les fotos · missatge final · peu de pàgina.

---

## Accessibilitat i rendiment

- HTML semàntic, amb `main`, `section`, `nav`, `header`, `footer` i encapçalaments
  ordenats.
- Tots els camps del formulari tenen etiqueta associada; els errors es narren.
- Navegació completa amb teclat, incloent-hi el menú, la galeria i l'acordió.
  Hi ha un enllaç *Salta al contingut* al principi.
- **`prefers-reduced-motion`**: si el sistema demana menys moviment, es desactiven
  el preloader, les animacions, el paral·laxi i el cursor personalitzat, i el
  contingut es mostra directament.
- El so ambient **sempre comença apagat** i es genera amb Web Audio (cap fitxer
  d'àudio, cap descàrrega).
- Els dos `canvas` (el mar i els estels) s'aturen quan no es veuen a pantalla.
- Sense llibreries externes. L'única càrrega de fora són les tipografies de
  Google Fonts.

### Tipografies

| Ús | Família |
|---|---|
| Titulars | Bodoni Moda |
| Text destacat i cursives | Cormorant Garamond |
| Interfície i etiquetes | Jost |
| Accents manuscrits | Mrs Saint Delafield |

Si les voleu servir des del mateix repositori (per no dependre de Google),
descarregueu-les, poseu-les a `assets/fonts/` i substituïu l'etiqueta `<link>`
de `casament.html` i `index.html` per unes regles `@font-face`.

---

*Fet amb ♥ vora el Mediterrani.*
