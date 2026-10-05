# Tâche : Catalogue piloté par le portail

## Détails
- **Date** : 05-10-2026-00-38
- **Statut** : Complétée

## Description

Les produits se créent, s'éditent et se suppriment depuis le portail. Ajouter un
produit produit sa page publique, et une image téléversée devient visible. Trois
défauts distincts ont été trouvés et corrigés au passage.

## Actions

1. **Fiche produit** :
   - `getSiteProduct()` passe désormais par `getSiteProducts()` et utilise donc
     les mêmes trois canaux que la liste.
   - Avant, il ne lisait que l'API Atelier et les fichiers du dépôt : tout
     produit créé dans le portail se retrouvait sans page, donc avec une
     adresse morte.

2. **Slug** :
   - Rempli automatiquement depuis le nom du produit pendant la saisie, et
     modifiable à la main.
   - Une modification manuelle arrête la remontée automatique.
   - La sauvegarde est refusée tant que le slug est vide : un slug vide
     s'enregistrait sans erreur et produisait l'adresse morte `/produit/`.

3. **Image** :
   - Le sélecteur enregistre l'URL publique, et non le chemin du fichier.
   - `remotePatterns` autorise l'hôte Supabase.
   - L'optimisation côté serveur est désactivée : le serveur ne joint pas cet
     hôte, et la laisser active ferait échouer le rendu.

4. **Réparation** :
   - Migration `supabase/011_image_paths.sql`.
   - Le produit existant `Test`, enregistré avec un slug vide, a reçu le slug
     `test`.

## Vérification

`/produit/test` renvoie 200 et l'URL d'image Supabase est présente dans le
markup. Les six pages produit d'origine, l'accueil, le catalogue, À propos et
l'admin renvoient 200. Type check propre. Commit `7d2bd2f`.