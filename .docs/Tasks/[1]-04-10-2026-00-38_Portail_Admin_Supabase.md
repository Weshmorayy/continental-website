# Tâche : Portail d'administration sur Supabase

## Détails
- **Date** : 04-10-2026-00-38
- **Statut** : Complétée

## Description

Un portail d'administration a été construit sur la route `/admin`, dans le même
déploiement Next.js que le site public : il n'y a pas de seconde application à
maintenir ni à synchroniser. Le navigateur lit et écrit directement dans
Supabase avec la clé publiable. Chaque règle d'accès est appliquée par la
sécurité niveau ligne (RLS), pas par l'interface : masquer un onglet ne protège
rien, seule la base protège.

## Actions

1. **Schéma** :
   - 15 tables créées : `tenants`, `categories`, `products`, `banners`,
     `shipping_zones`, `faqs`, `orders`, `leads`, `site_settings`, `media`,
     `site_backups`, `pages`, `content_blocks`, `audit_events`, `site_admins`.
   - La colonne de référence s'appelle `ref_` et non `ref` : `ref` est un mot
     réservé SQL, et son usage brut fait échouer la migration.
   - `specs` et `features` sont typés `JSONB` : les caractéristiques techniques
     n'ont pas la même structure d'un produit à l'autre, une colonne figée
     contraindrait le catalogue pour rien.

2. **Sécurité** :
   - RLS en mode fail-closed sur les 15 tables exposées publiquement : sans
     policy explicite, la lecture est refusée, jamais accordée par défaut.
   - Un visiteur anonyme ne lit que le contenu publié. Il n'atteint jamais
     `orders`, `leads`, `site_settings`, `site_backups` ni `audit_events`.
   - Bucket de stockage public `continental`, écriture restreinte aux
     administrateurs.

3. **Portail** :
   - 13 onglets : Catalogue, Commandes, Demandes, Contenu, Bannières,
     Livraison, FAQ, Médiathèque, Sauvegardes, Utilisateurs, Réglages,
     Statistiques, Journal.
   - L'édition d'un produit est passée d'un formulaire en ligne à une modale
     plein écran : à cette taille de formulaire, la page ne pouvait plus être
     lue pendant la saisie.

4. **Interface** :
   - Le bloc `admin-` ajouté dans `src/app/globals.css` est purement additif,
     le design validé du site public n'y est pas touché.
   - Sous 767 px, les tableaux de données deviennent des cartes étiquetées
     grâce à `td::before { content: attr(data-label) }`.

## Vérification

La suite RLS passe ses 20 contrôles avec des données réellement insérées en
base : sur des tables vides, une policy inactive passerait inaperçue. Toutes
les pages du portail répondent 200. Le portail a été servi puis inspecté sur
une largeur de téléphone.