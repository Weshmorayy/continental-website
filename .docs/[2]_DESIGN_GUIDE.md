# [2] Guide Design — Continental®

> Réécrit après le retour client : « trop générique », refus du noir et du bleu.
> Nouvelle référence de structure : samsung.com — **structure** reprise, **couleurs** non.

## Origine de la décision

Le client a envoyé des captures de samsung.com en demandant « quelque chose comme ça ».
Volontairement **non copié** :

- Le HTML de samsung.com/fr fait 372 Ko dont **73 % sont des `<script>`**, un seul `<h1>`
  (caché, `class="blind"`), et tout le style vit dans 32 bundles CSS minifiés hashés.
  Un scrap ne rendrait ni le contenu ni le design.
- L'accent de Samsung est **bleu** — le client refuse explicitement le bleu.
- Their design system is a protected brand asset.

Ce qui est repris, c'est le **système** : fond blanc « platinum », texte presque noir,
CTA en pilule noire, angles très arrondis, espace généreux, photo produit en héros,
un accent unique et rare.

## Palette

| Variable CSS | Valeur | Rôle |
|---|---|---|
| `--color-bg-primary` | `#FFFFFF` | Blanc pur — fond par défaut, scènes produit |
| `--color-bg-secondary` | `#F8F6F3` | Blanc cassé — sections alternées |
| `--color-bg-tertiary` | `#EFE9E1` | Sable — arguments et pied de page |
| `--color-bg-card` | `#FFFFFF` | Fond des cartes produit |
| `--color-text-primary` | `#16130F` | Titres, texte fort, **pilules CTA principales** |
| `--color-text-body` | `#4A443E` | Corps de texte |
| `--color-text-muted` | `#8B837A` | Labels, références |
| `--color-accent` | `#B84E22` | **Accent unique** — prix, liens actifs, surtitres |
| `--color-accent-hover` | `#963C16` | Hover accent |
| `--color-accent-light` | `#FAEDE6` | Fonds de badge, sans aplat plein |
| `--color-gold` | `#B4832E` | Détails fins seulement |
| `--color-border` | `#E7E2DB` | Bordures, 1px — jamais 2px |
| `--color-border-dark` | `#D6CEC4` | Séparateurs |

**Interdits absolus :** le bleu (`blue-*`, `sky-*`, `indigo-*`, `slate-*`), les sections
sombre, les dégradés Tailwind génériques, `rounded-none`.

> `--color-bg-dark` / `--color-bg-dark-card` restent déclarés pour la compatibilité
> Tailwind mais **ne doivent plus être utilisés**.

## Typographie

| Rôle | Police | Graisses | Source |
|------|--------|----------|--------|
| Titres | Fraunces | 400, 600, 700 | Google Fonts |
| Corps | Plus Jakarta Sans | 400, 500, 600, 700 | Google Fonts |
| Références produits | JetBrains Mono | 500, 700 | Google Fonts |

Fraunces remplace Barlow Condensed : la condensée industrielle contribuant à l'effet
« template ». Un serif chaleureux sur fond blanc donne une signature premium.

**H1 hero :** `clamp(2.75rem, 7vw, 4.75rem)` / Fraunces 600 / `tracking-[-0.02em]`
**H1 page :** `clamp(2.5rem, 6vw, 4.25rem)` / Fraunces 600
**H2 section :** `3–3.25rem` / Fraunces 600
**H3 :** `1.125–1.25rem` / Fraunces 600
**Prix :** Fraunces 600, couleur accent
**Références :** `0.7rem` / JetBrains Mono 700

## Composants

| Nom | Rendu |
|---|---|
| `.btn-accent` | **Pilule noire** — CTA principal (équivalent du « Achetez ») |
| `.btn-outline-dark` | Pilule blanche, contour 1.5px noir — CTA secondaire |
| `.btn-wa` | Pilule verte WhatsApp — convention de marque, pas couleur de site |
| `.btn-terracotta` | Pilule accent — points de conversion clés, usage rare |
| `.plinth` | Scène produit blanche, rayon 24px, bordure 1px |
| `.card-warm` | Carte blanche arrondie, élévation au survol |
| `.eyebrow` | Surtitre mono + filet — **une fois par section**, jamais de badge flottant |

## Rythme des fonds — Page Accueil

1. `bg-primary` (blanc) — Hero
2. `bg-secondary` (blanc cassé) — Gammes
3. `bg-primary` (blanc) — Bestseller
4. `bg-tertiary` (sable) — Arguments
5. `bg-primary` (blanc) — Catalogue aperçu
6. `bg-secondary` (blanc cassé) — Livraison
7. `bg-tertiary` (sable) — Footer

Aucune section sombre. Jamais 3 fonds consécutifs identiques.

## Images

Les visuels `public/aesthetic/` sont des **photos stock trouvées en ligne**, pas des
photos du client. Signalé au commanditaire — à remplacer avant livraison finale.
Les photos `public/products/` sont à confirmer avec le client.
