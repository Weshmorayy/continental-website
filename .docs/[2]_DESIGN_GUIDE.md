# [2] Guide Design — Continental®

## Palette

| Variable CSS | Valeur | Rôle |
|---|---|---|
| `--color-bg-primary` | `#FFFFFF` | Fond principal, fond produits |
| `--color-bg-secondary` | `#F4F4F4` | Sections alternées (bestseller, livraison, produits similaires) |
| `--color-bg-dark` | `#0D0D0D` | Hero, arguments, footer, header catalogue |
| `--color-bg-card` | `#FAFAFA` | Fond des cartes produit |
| `--color-text-primary` | `#0D0D0D` | Titres sur fond clair |
| `--color-text-light` | `#FFFFFF` | Texte sur fond sombre |
| `--color-text-body` | `#3D3D3D` | Corps de texte |
| `--color-text-muted` | `#888888` | Labels, références, secondaire |
| `--color-accent` | `#1A6FBF` | CTA, badges, liens actifs, check icons |
| `--color-accent-hover` | `#1558A0` | Hover sur boutons accent |
| `--color-accent-light` | `#E8F1FA` | Fond léger accent (info boxes) |
| `--color-border` | `#E0E0E0` | Bordures sur fond clair |
| `--color-border-dark` | `#2A2A2A` | Bordures sur fond sombre |

## Typographie

| Rôle | Police | Graisses | Source |
|------|--------|---------|--------|
| Titres | Barlow Condensed | 700, 800 | Google Fonts |
| Corps | Inter | 400, 500 | Google Fonts |
| Références produits | JetBrains Mono | 400 | Google Fonts |

**H1 hero :** `clamp(3rem, 8vw, 6.5rem)` / Barlow Condensed 900  
**H1 page :** `clamp(2.5rem, 6vw, 5rem)` / Barlow Condensed 900  
**H2 section :** `2.5–3rem` / Barlow Condensed 700  
**H3 carte :** `1.125rem` / Barlow Condensed 700  
**Prix :** `1.5–2.2rem` / Barlow Condensed 700 / couleur accent  
**Références :** `0.7rem` / JetBrains Mono 400 / text-muted

## Direction visuelle

**"Precision Noire"** — fond noir pour les sections impact, blanc pur pour les produits, bleu #1A6FBF exclusivement sur les CTA et badges. Asymétrie construite (grilles 3+2, 60/40). Numéros géants en ghost text (#0D0D0D @ 7% opacity) à la place des icônes.

## Alternance des fonds — Page Accueil

1. `bg-dark` — Hero
2. `bg-primary` — Gammes
3. `bg-secondary` — Bestseller
4. `bg-dark` — Arguments
5. `bg-primary` — Catalogue aperçu
6. `bg-secondary` — Livraison
7. `bg-dark` — Footer
