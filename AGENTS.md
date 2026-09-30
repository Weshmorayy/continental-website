# AGENTS.md — Continental Website

> Règles spécifiques au projet Continental. Lire avant toute intervention sur ce projet.

---

## Identité du projet

- **Client** : Continental®
- **Slug** : continental-website
- **Type** : Boutique en ligne (commande WhatsApp)
- **Ville** : Dakar, Sénégal
- **Stack** : Next.js 14 App Router + TypeScript + Tailwind CSS

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

## Palette (NE PAS MODIFIER sans brief client)

```
bg-dark:      #0D0D0D   ← Fond hero, arguments, footer
bg-secondary: #F4F4F4   ← Sections alternées
accent:       #1A6FBF   ← CTA, badges, liens actifs — bleu extrait des fiches produits
```

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
