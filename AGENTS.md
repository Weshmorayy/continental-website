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

## Palette (reconstruite d'après les captures samsung.com)

Deux versions ont été refusées (« trop générique », puis « ça ne ressemble pas à
Samsung »). Base actuelle, relevée sur les captures de référence :

```
bg-primary:   #FFFFFF   ← fond de page
bg-secondary: #F5F5F5   ← héros + surfaces produit (gris clair Samsung)
bg-tertiary:  #EBEBEB   ← contraste de ton
text-primary: #000000   ← titres ET pilules CTA principales
text-muted:   #757575   ← gris standard Samsung
accent:       #B84E22   ← accent UNIQUE — sur-surtitre, prix
```

**Typographie : Archivo (titres) + Inter (texte).** samsung.com utilise SamsungOne,
propriétaire et sous licence — Archivo est le substitute gratuit le plus proche.
**Ne jamais réintroduire de serif** (Fraunces a été essayé et refusé).

Interdits : `blue-*` / `sky-*` / `indigo-*` / `slate-*`, sections de fond sombre,
dégradés Tailwind génériques, `rounded-none`, `border-2`.
Détail complet dans `.docs/[2]_DESIGN_GUIDE.md`.

## Images

- `public/products/*.png` : fonds détourés en transparent — les sources `.jpg`
  étaient à fond blanc pur et laissaient un rectangle blanc sur les surfaces grises.
- `public/aesthetic/` : photos **stock** trouvées en ligne, pas des photos du client
  — signalé au commanditaire, à remplacer avant livraison.

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
