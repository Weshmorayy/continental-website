# AGENTS.md — Continental Website

> Règles spécifiques au projet Continental. Lire avant toute intervention sur ce projet.

---

## Identité du projet

- **Client** : Continental®
- **Slug** : continental-website
- **Type** : Boutique en ligne (commande WhatsApp)
- **Ville** : Dakar, Sénégal
- **Stack** : Next.js 15 App Router + TypeScript + Tailwind CSS (React 19)

---

## Pages

| Route | Fichier | Statut |
|-------|---------|--------|
| `/` | `src/app/page.tsx` | ✅ Construit |
| `/catalogue` | `src/app/catalogue/page.tsx` | ✅ Construit |
| `/produit/[slug]` | `src/app/produit/[slug]/page.tsx` | ✅ Construit |

---

## Règles spécifiques à ce projet

- **Prix** : 30 000 FCFA (placeholder) — à remplacer dans `src/data/products.ts` quand le client confirme
- **WhatsApp** : `+221 77 000 00 00` (placeholder) — à remplacer dans `src/config/site.ts`
- **Climatiseurs** : Aucune photo disponible — section "Bientôt" dans les gammes
- **Toutes les données métier** viennent de `src/config/site.ts` et `src/data/products.ts`
- **Aucune donnée** hardcodée dans les composants

## Palette (révisée après brief client — ne plus revenir au noir/bleu)

Le client a refusé « noir et bleu » comme « trop générique ». Nouvelle base :
fond blanc « platinum », texte presque noir, CTA en pilule noire, **un** accent
terre cuite utilisé avec parcimonie. Structure inspirée de samsung.com, couleurs non.

```
bg-primary:   #FFFFFF   ← Fond par défaut, scènes produit
bg-secondary: #F8F6F3   ← Sections alternées
bg-tertiary:  #EFE9E1   ← Arguments + footer
text-primary: #16130F   ← Titres ET pilules CTA principales
accent:       #B84E22   ← Accent UNIQUE — prix, liens actifs, surtitres
```

Interdits : toute classe `blue-*` / `sky-*` / `indigo-*` / `slate-*`, les sections
de fond sombre, les dégradés Tailwind génériques, `rounded-none`, et les bordures `border-2`.
Détail complet dans `.docs/[2]_DESIGN_GUIDE.md`.

## Images

Les visuels de `public/aesthetic/` sont des photos **stock** trouvées en ligne, pas des
photos du client — signalé au commanditaire, à remplacer avant livraison.

## Composants créés

| Composant | Chemin |
|-----------|--------|
| `Header` | `src/components/layout/Header.tsx` |
| `Footer` | `src/components/layout/Footer.tsx` |
| `ProductCard` | `src/components/ui/ProductCard.tsx` |
| `GalleryViewer` | `src/components/ui/GalleryViewer.tsx` |
| `TechSpecTable` | `src/components/ui/TechSpecTable.tsx` |
| `HeroSection` | `src/components/sections/HeroSection.tsx` |
| `GammesSection` | `src/components/sections/GammesSection.tsx` |
| `BestsellerSection` | `src/components/sections/BestsellerSection.tsx` |
| `ArgumentsSection` | `src/components/sections/ArgumentsSection.tsx` |
| `CatalogueApercu` | `src/components/sections/CatalogueApercu.tsx` |
| `LivraisonSection` | `src/components/sections/LivraisonSection.tsx` |
| `CatalogueGrid` | `src/components/sections/CatalogueGrid.tsx` |
