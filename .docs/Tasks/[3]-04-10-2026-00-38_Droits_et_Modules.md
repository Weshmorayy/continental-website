# Tâche : Journal, statistiques et droits par module

## Détails
- **Date** : 04-10-2026-00-38
- **Statut** : Complétée

## Description

Trois briques ont été livrées : un journal d'activité strictement append-only,
un module de statistiques, et des permissions par module appliquées par la base
de données et non par l'interface. Un droit accord dans le navigateur mais pas
dans la base n'existe pas.

## Actions

1. **Journal** :
   - `audit_events` est protégée par un trigger qui la rend append-only : la
     mise à jour et la suppression y sont refusées.
   - Deux points d'entrée, `log_event()` et `record_event()`.
   - Chaque entrée conserve l'email de l'acteur, son rôle, l'action, l'entité
     concernée et son libellé lisible.

2. **Statistiques** :
   - Les visites sont comptées par page dans `site_events`.

3. **Droits** :
   - `module_of()` et `can_module()` sont définis dans
     `supabase/007_permissions.sql`.
   - Le raccourci `admin_all` a été retiré : il appelait `is_site_admin()` et
     ignorait la colonne `permissions` en entier, donc tous les droits
     accordés individuellement étaient sans effet.

4. **Règle** :
   - Chaque module porte `read` ou `write`, déclaré ainsi :
     `{ products: 'read,write' }`.
   - `write` implique `read`.
   - `stats` et `logs` ne sont pas accordables : ils restent avec l'agence.

5. **Portefeuille** :
   - `deleteUser` a dû contourner le helper générique `mutate()`, qui filtre
     sur `id` alors que `site_admins` est indexée par `email`.

## Vérification

La suite de permissions est passée de 13 à 14 contrôles, exécutée avec deux
comptes réels, et stable sur trois exécutions consécutives. L'élévation de
privilèges est testée explicitement : un éditeur qui envoie un PATCH sur sa
propre ligne pour obtenir `orders:write` voit sa requête refusée, ce qui a été
revérifié ensuite directement en base.