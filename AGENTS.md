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

## Palette — MONOCHROME, valeurs extraites de la CSS réelle de samsung.com

Tokens relevés dans leurs bundles (`clientlib-base-ux25.min`, `page-home-v2`) :
`.bg-white #fff`, `.bg-light-gray #f7f7f7`, `.bg-dark-gray #313131`,
`.cta--black` = fond `#000` / texte `#fff`. Gris relevés : `#f7f7f7 #eee #ddd
#aaa #8f8f8f #757575 #555 #313131`. Rayons : `50%`, `24px`, `20px`, `8px`, `6px`.

```
bg-primary:   #FFFFFF   ← surface PRODUIT (obligatoire : visuels à fond blanc)
bg-secondary: #F7F7F7   ← bandes de section
bg-tertiary:  #EEEEEE   ← contraste de ton
text-primary: #000000   ← titres ET pilules CTA
text-muted:   #757575
accent:       #000000   ← remplace le bleu #2189ff de la référence
```

**Zéro couleur chaude.** Les versions terracotta et crème ont été refusées
explicitement par le commanditaire. Le seul vert restant est `.btn-wa`
(convention de marque WhatsApp, pas une couleur du site).

**Typographie : Archivo (titres) + Inter (texte).** SamsungOne est propriétaire ;
Archivo est le substitute gratuit le plus proche. Aucun serif.

⚠ **Les classes custom vivent dans `@layer components`, jamais `utilities`.**
Sinon `.btn-accent { display:inline-flex }` passe après `.hidden { display:none }`
et le bouton déborde sur mobile malgré `hidden xl:inline-flex`.

Interdits : `blue-*` / `sky-*` / `indigo-*` / `slate-*`, fonds sombres,
dégradés génériques, `rounded-none`, `border-2`.
Détail complet dans `.docs/[2]_DESIGN_GUIDE.md`.

## Images

Les visuels de `public/products/` sont des **JPEG à fond blanc pur**. Ils doivent
impérativement être posés sur une surface **blanche** (`.stage`, `.card-product`,
`.card-white`) — sinon un rectangle blanc apparaît. La tentative de détourage en
PNG transparent a été **abandonnée** (voir le guide design).

## Portail Atelier (contenu distant)

Le contenu peut venir de l'administration multi-clients
(`~/atelier/atelier-admin`) au lieu des fichiers du dépôt.

```bash
ATELIER_ADMIN_URL=https://admin.votredomaine.sn   # vide = données locales
ATELIER_TENANT=continental
```

- `src/lib/atelier.ts` est le SEUL point d'accès au contenu distant. Les
  composants ne savent pas d'où viennent les données : c'est ce qui permet de
  brancher l'admin sans les modifier.
- **Repli automatique** : API absente ou injoignable → données locales. Le build
  n'échoue jamais sur ce point.
- `generateStaticParams` lit le contenu réel : un produit ajouté dans l'admin
  obtient sa page au prochain rebuild, déclenché par un deploy hook Coolify.
- Ne jamais importer `@/data/products` depuis un composant : passer par
  `getSiteProducts()` / `getSiteProduct()`.

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
