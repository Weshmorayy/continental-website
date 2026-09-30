# Continental® — Site Web & Catalogue

Site vitrine et boutique en ligne pour **Continental®** (Dakar, Sénégal) : ventilateurs sur pied, muraux, orbitaux et climatiseurs.

## Stack Technique

- **Framework :** [Next.js](https://nextjs.org/) (App Router) + TypeScript
- **Styling :** [Tailwind CSS](https://tailwindcss.com/) avec variables CSS personnalisées
- **Icônes :** [Lucide React](https://lucide.dev/)
- **Commandes :** Intégration WhatsApp directe avec messages préformatés
- **SEO :** Métadonnées dynamiques par page/produit + Schema.org `LocalBusiness` + Sitemap & Robots.txt

---

## Architecture Multi-Pages

- `/` : Page d'accueil (Hero immersif, Gammes asymétriques, Bestseller en avant, Différenciateurs techniques 100% cuivre, Aperçu catalogue, Grille zones de livraison Dakar & paiements Wave/Orange Money/Free Money).
- `/catalogue` : Catalogue complet filtrable dynamiquement par catégorie avec statut de disponibilité et teaser climatiseurs.
- `/produit/[slug]` : Fiches techniques détaillées (référence exacte, tableau des caractéristiques AC/W/Hz, garantie 2 ans, double CTA WhatsApp & Appel, produits similaires).
- `/not-found` : Page 404 sur mesure.

---

## Déploiement Coolify & Docker

Ce projet est **100% Coolify-ready** grâce à son `Dockerfile` multi-stage optimisé pour le mode standalone de Next.js.

### Déploiement automatique sur Coolify

1. Dans Coolify, cliquer sur **New Resource** > **Application**.
2. Choisir la source **GitHub** et sélectionner ce dépôt `continental-website`.
3. Sélectionner **Dockerfile** comme type de build (ou laisser Nixpacks détecter automatiquement).
4. Configurer le port de destination : `3000`.
5. Déployer !

---

## Développement Local

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement
npm run dev

# Build de production
npm run build
```
