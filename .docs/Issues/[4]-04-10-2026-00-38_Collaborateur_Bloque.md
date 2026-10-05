# Issue : Un collaborateur ne peut pas prouver qu'il est collaborateur

## Détails
- **Date** : 05-10-2026-00-38
- **Statut** : Résolue

## Description

La connexion avec le compte éditeur renvoyait « Compte authentifié, mais
absent de la liste des administrateurs. » L'authentification avait réussi ;
seul le contrôle d'autorisation refusait l'entrée. Seul le compte `admin`
pouvait se connecter au portail.

## Cause Racine

Le portail décide de l'accès en lisant la table `site_admins` — via
`checkAdmin()` dans `src/context/StoreContext.tsx`. Mais la policy RLS
`admins_read` exigeait `is_site_owner()`, et `is_site_owner()` exige
`role = 'admin'`. Un éditeur recevait donc zéro ligne sur sa propre recherche,
et l'application lisait ce résultat vide comme « pas administrateur ».
Dépendance circulaire : prouver qu'on est éditeur exigeait d'être admin.

## Solution

La migration `supabase/010_admin_self_read.sql` remplace `admins_read` par
`is_site_owner() OR lower(email) = lower(auth.jwt()->>'email')`. Chaque
utilisateur authentifié peut désormais lire sa propre ligne et rien d'autre
— vérifié en HTTP : l'éditeur voit 1 ligne, l'agence en voit 2. Les
écritures restent réservées au propriétaire du site.

```sql
is_site_owner() OR lower(email) = lower(auth.jwt()->>'email')
```

La branche de gauche préserve les droits du propriétaire, la branche de
droite n'ouvre qu'une lecture de sa propre ligne : lire son adresse n'accorde
aucun droit nouveau.

## Prévention

Dès qu'une policy garde la table qui décide *aussi* de l'accès, se demander
ce qu'un utilisateur non privilégié doit pouvoir lire pour établir sa propre
identité. « Zéro ligne » et « refusé » sont la même chose en PostgREST : ne
jamais déduire une intention d'un tableau vide.
