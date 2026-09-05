# Fotografies

Deseu aquí totes les imatges del web. Mentre no n'hi hagi cap, el web ensenya
composicions de degradat generades amb CSS, així que mai es veurà trencat.

## Com substituir un marcador de posició per una foto real

Busqueu al fitxer `index.html` l'element amb classe `frame` que voleu canviar
i afegiu-hi la propietat `--img`:

```html
<!-- Abans -->
<div class="frame frame--tall ph-stone"></div>

<!-- Després -->
<div class="frame frame--tall" style="--img:url('assets/images/nosaltres-01.jpg')"></div>
```

Si voleu conservar el degradat de fons per si la foto triga a carregar,
deixeu la classe `ph-*`:

```html
<div class="frame frame--tall ph-stone" style="--img:url('assets/images/nosaltres-01.jpg')"></div>
```

## Noms recomanats

| Fitxer | On surt |
|---|---|
| `og.jpg` | Previsualització quan es comparteix l'enllaç (1200 × 630 px) |
| `convent.jpg` | Fons de la secció EL LLOC |
| `costa-brava.jpg` | Fons de la secció LA COSTA BRAVA |
| `historia-01.jpg` … `historia-04.jpg` | La nostra història |
| `galeria-01.jpg` … `galeria-08.jpg` | Galeria de fotos |
| `postal-01.jpg` … `postal-05.jpg` | Postals arrossegables |
| `hotel-01.jpg` … | Targetes d'allotjament |

## Mides i pes

- Amplada màxima recomanada: **2000 px** per a fons, **1200 px** per a la resta.
- Format **JPG** de qualitat 80 o **WebP**.
- Intenteu que cap fitxer passi d'**400 KB**: GitHub Pages no comprimeix imatges.
