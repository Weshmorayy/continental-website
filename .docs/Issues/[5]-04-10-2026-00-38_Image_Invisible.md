# Issue : L'image téléversée reste invisible

## Détails
- **Date** : 05-10-2026-00-38
- **Statut** : Résolue

## Description

Un produit a été créé depuis le portail avec une image téléversée. Le produit
apparaissait au catalogue, sans aucune photo, et aucune erreur n'était jamais
signalée nulle part. Le téléversement avait réussi du point de vue du client.

## Cause Racine

Deux bugs indépendants. D'abord, `src/components/admin/ImagePicker.tsx`
enregistrait `media.path` (`produits/photo.png`) au lieu de `media.url`. Un
chemin nu se résout contre la racine du site : le navigateur demandait
`https://<domaine>/produits/photo.png` → HTTP 404. Le téléversement
réussissait, la ligne s'enregistrait, rien n'échouait.

Ensuite, même avec la bonne URL, `next/image` n'avait aucun `remotePatterns`
pour l'hôte de stockage Supabase et la rejetait. Après ajout, l'optimiseur
côté serveur a renvoyé HTTP 500 : il fait télécharger l'image par le
*serveur*, et le serveur n'atteint pas l'hôte de stockage Supabase
(IPv6 uniquement, expiration du délai).

## Solution

Le sélecteur enregistre désormais `m.url || m.path`. `next.config.mjs` dérive
les `remotePatterns` de `NEXT_PUBLIC_SUPABASE_URL`, avec repli sur
`*.supabase.co`. L'optimisation serveur est désactivée
(`unoptimized: true`) : le navigateur récupère l'image directement depuis
Supabase — plus rapide, et toujours joignable. La migration
`supabase/011_image_paths.sql` répare les lignes déjà enregistrées en chemin
nu, par correspondance exacte sur `media.path`, de sorte que les images
présentes dans `public/` (`/products/…`, `/aesthetic/…`) restent intactes.

## Prévention

Stocker et afficher la même forme de référence. `path` est un nom à
l'intérieur d'un seau ; `url` est ce qu'un navigateur peut aller chercher. Ne
jamais laisser un chemin relatif s'échapper de l'admin.
