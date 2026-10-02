# [2] Guide Design — Continental®

> Reconstruit d'après les captures de samsung.com/us fournies par le commanditaire.
> **Structure et typographie : oui. Couleurs : non** (le client refuse le bleu).

## Origine de la décision

Deux tentatives ont précédé ce document :

1. **« Precision Noire »** — fond noir + bleu royal. Refusé : « trop générique ».
2. **« Chaleureuse Premium »** — crème, serif Fraunces, split deux colonnes.
   Refusé : le client a constaté que le rendu ne ressemblait pas du tout à Samsung.

Le serif était le signal le plus visible de l'échec. Cette version part des
**captures réelles** du site de référence, pas d'une interprétation.

## Pourquoi pas de scraping

Les outils existent et fonctionnent — [Picker.Design](https://picker.design/),
[MiroMiro](https://miromiro.app/website-to-code), [SingleFile](https://www.getsinglefile.com/),
[monolith](https://github.com/y2z/monolith). Deux blocages concrets :

- Tous exigent un Chromium de bureau, absent de l'environnement de build (Termux/Android).
- `monolith` et SingleFile n'exécutent pas JavaScript. Or `samsung.com/fr` renvoie
  372 Ko dont **73 % de `<script>`**, un seul `<h1>` — caché, `class="blind"` — et
  tout le style dans 32 bundles CSS minifiés hashés. Un scrape rend une page vide.

**Les captures fournies restent la meilleure source disponible.**

## Police

samsung.com utilise **SamsungOne** — police propriétaire sous licence, non
réutilisable. D'après [l'analyse de sa CSS](https://www.sitefontcheck.com/fontsusedby/samsung.com),
la pile est `samsungone, arial, sans-serif` avec `samsungsharpsans` en repli.

Substitute gratuit retenu :

| Rôle | Police | Graisses | Source |
|------|--------|----------|--------|
| Titres | **Archivo** | 500, 600, 700, 800, 900 | Google Fonts |
| Corps | **Inter** | 400, 500, 600, 700 | Google Fonts |

Archivo est une grotesque géométrique neutre, sturdy et très grasse en Display —
le plus proche disponible de SamsungOne. **Ne jamais réintroduire un serif.**

## Palette

| Variable CSS | Valeur | Rôle |
|---|---|---|
| `--color-bg-primary` | `#FFFFFF` | Blanc — fond de page, cartes de contenu |
| `--color-bg-secondary` | `#F5F5F5` | Gris clair — héros, surfaces produit, tuiles |
| `--color-bg-tertiary` | `#EBEBEB` | Gris soutenu — contraste de ton, panneaux |
| `--color-text-primary` | `#000000` | Titres — noir franc, comme Samsung |
| `--color-text-body` | `#333333` | Corps de texte |
| `--color-text-muted` | `#757575` | Labels, gris standard Samsung |
| `--color-accent` | `#B84E22` | **Accent unique** — sur-surtitre, prix, points |
| `--color-accent-hover` | `#963C16` | Hover accent |
| `--color-accent-light` | `#FAEDE6` | Fond de badge, jamais en aplat de section |
| `--color-gold` | `#B4832E` | Détails fins |
| `--color-border` | `#E5E5E5` | Filets 1px |

Équivalent du « Available now » bleu de Samsung → notre sur-surtitre terre cuite,
utilisé **une seule fois par section**, jamais en aplat.

**Interdits :** `blue-*`, `sky-*`, `indigo-*`, `slate-*`, `cyan-*` ; sections de fond
sombre ; dégradés Tailwind génériques ; `rounded-none` ; `border-2`.

> `--color-bg-dark` reste déclaré pour la compatibilité Tailwind mais **ne doit
> plus être utilisé**.

## Composants

| Nom | Rendu |
|---|---|
| `.btn-accent` | **Pilule noire** — CTA principal (`border-radius: 9999px`) |
| `.btn-outline` | Pilule contour noir — CTA secondaire (« View all ») |
| `.btn-wa` | Pilule verte WhatsApp — convention de marque, pas couleur de site |
| `.btn-terracotta` | Pilule accent — usage rare |
| `.link-underline` | Lien souligné — « Learn more » |
| `.stage` | Surface produit **grise, sans bordure**, rayon 16px |
| `.card-product` | Tuile produit grise, élévation au survol |
| `.hairline` | Filet 1px pleine largeur |
| `.carousel-row` | Rangée à défilement horizontal avec accroche |
| `.eyebrow` / `.eyebrow-center` | Sur-surtitre accent — **une fois par section** |
| `.display-xl/.lg/.md/.sm` | Échelle de titres Archivo |

## Assets produits — détourage obligatoire

Les six visuels de `public/products/` étaient des **JPEG à fond blanc pur**
(vérifié : coins à `srgb(255,255,255)`). Posés sur une surface grise, ils
laisseraient un rectangle blanc visible.

Ils ont été détourés en PNG transparents :

```sh
convert "$f" -alpha set -fuzz 8% -fill none -draw "matte 0,0 floodfill" \
  -trim +repage -resize '1000x1000>' -strip "${f%.*}.png"
```

Le `floodfill` part du coin (0,0) : il ne mange que le fond extérieur connecté,
**pas le corps blanc des climatiseurs** (vérifié visuellement sur les six).
Les originaux `.jpg`/`.webp` sont conservés comme sources.

## Rythme des fonds — Page Accueil

1. `bg-secondary` (gris) — Héros, centré
2. `bg-primary` (blanc) — Gammes
3. `bg-secondary` (gris) — Bestseller
4. `bg-secondary` (gris) — Arguments *(léger changement de rythme via les filets)*
5. `bg-primary` (blanc) — Catalogue aperçu (carrousel)
6. `bg-primary` (blanc) — Livraison
7. `bg-primary` (blanc) — Footer à filets

Aucune section sombre. Jamais 3 fonds consécutifs strictement identiques.

## Images

`public/aesthetic/` = photos **stock** trouvées en ligne, pas des photos du client.
Signalé au commanditaire — à remplacer avant livraison finale.
Les photos produits sont également des visuels stock (dossier « Stock-Images/Products »).

## Données non sourcées — supprimées

- « Réponse en moins de 15 minutes » → engagement de délai **inventé**, retiré.
- « 7j/7 » → contredisait `siteConfig.hours.sunday: 'Fermé'`. Les horaires
  affichés sont désormais dérivés de `siteConfig.hours` pour ne plus pouvoir diverger.

> **À confirmer client :** l'atelier est-il ouvert le dimanche ? Si oui, corriger
> `siteConfig.hours.sunday`.
