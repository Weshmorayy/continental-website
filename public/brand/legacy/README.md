# Ancien logo Continental® — conservé volontairement

Ces quatre fichiers sont l'**ancien logo**, celui où le grand « C » faisait
partie du mot CONTINENTAL et où la marque tenait sur une seule ligne
horizontale (1146 × 244).

Ils sont gardés ici, tels quels, parce que le client peut vouloir revenir en
arrière : le nouveau logo est un bloc vertical (la marque « C » posée
au-dessus du mot) et son rendu est très différent.

## Revenir à l'ancien logo

1. Copier le fichier voulu à la racine de `public/brand/` sous le nom attendu
   par le code :

   ```bash
   cd public/brand
   cp legacy/wordmark-logo-light.png            logo-light.png
   cp legacy/wordmark-logo-white-transparent.png logo-white-transparent.png
   cp legacy/wordmark-logo-dark-bg.png           logo-dark-bg.png
   cp legacy/wordmark-favicon-source.png         favicon-source.png
   ```

2. Rétablir les proportions déclarées dans `next/image`, sinon la boîte
   réservée est trop haute et la barre saute pendant le chargement :

   | Fichier | `width` / `height` | classe de hauteur |
   |---|---|---|
   | `src/components/layout/Header.tsx` | `150` / `42` | `h-6 sm:h-7 lg:h-8` |
   | `src/components/layout/Footer.tsx` | `150` / `42` | `h-7` |
   | `src/app/admin/page.tsx` | `150` / `42` | `h-6 sm:h-7` |

## Quel fichier pour quel fond

| Fichier | Fond | Contenu |
|---|---|---|
| `wordmark-logo-light.png` | blanc / clair | logo en couleurs |
| `wordmark-logo-white-transparent.png` | foncé / photo | logo blanc, fond transparent |
| `wordmark-logo-dark-bg.png` | foncé | logo blanc, fond transparent |
| `wordmark-favicon-source.png` | — | ancienne icône d'onglet |

Le nouveau logo suit la même logique à la racine de `public/brand/` :
`logo-light.png` pour les fonds clairs, `logo-white-transparent.png` et
`logo-dark-bg.png` pour les fonds foncés.
