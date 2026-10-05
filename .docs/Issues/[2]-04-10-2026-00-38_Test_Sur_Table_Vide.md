# Issue : Un test de sécurité qui passe sur des tables vides

## Détails
- **Date** : 05-10-2026-00-38
- **Statut** : Résolue

## Description

La suite RLS annonçait 20/20 PASS alors que deux tables étaient grandes
ouvertes à la lecture anonyme. La suite était verte, la base fuyait. Un
rapport au vert avait donc été produit par un test qui ne testait rien — et
c'est ce rapport au vert qui a fait passer la fuite pour une base saine.

## Cause Racine

Les contrôles affirmaient « une lecture anonyme renvoie 0 lignes ». Sur une
table vide, une lecture *autorisée* renvoie aussi 0 lignes : le test passait
à vide, il ne distinguait pas un refus correct d'une lecture réussie de rien.
La valeur observée était compatible avec les deux scénarios, et le test ne
pouvait donc pas trancher.

C'est précisément ce qui a laissé passer le problème RLS décrit dans
[1] : une policy inactive sur `media` et `site_backups` produisait exactement
la même réponse qu'une policy correcte sur une table sans données.

## Solution

La suite insère désormais des lignes sonde — produit `RLS-SONDE-1`, FAQ
« Sonde RLS », fichier média `test/rls-sonde.jpg`, sauvegarde `Sonde RLS` —
exécute les contrôles, puis ne supprime que ses propres sondes. Un 20/20 PASS
prouve désormais réellement que les refus ont lieu. C'est la leçon la plus
importante du projet.

## Prévention

Toute assertion de sécurité doit d'abord prouver que la donnée EXISTE et
qu'elle se lit avec un compte légitime. Si un contrôle peut passer avec zéro
ligne, ce n'est pas un test : c'est un constat d'absence, indiscernable d'un
succès.

L'ordre des opérations est donc figé : semer les sondes, vérifier qu'un
compte légitime les lit, exécuter les contrôles anonymes, puis nettoyer.
Une étape sautée invalide toutes les suivantes — c'est exactement ce qui
s'est produit ici, la phase de semis ayant été omise.
