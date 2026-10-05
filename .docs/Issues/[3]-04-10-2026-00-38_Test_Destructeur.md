# Issue : Un test qui détruit la donnée qu'il devait protéger

## Détails
- **Date** : 05-10-2026-00-38
- **Statut** : Résolue

## Description

Un vrai produit, `ventilateur-pied-fs4011`, a disparu du catalogue. La
suppression avait été exécutée par la suite de tests des permissions. Le
catalogue affiché en production ne contenait plus que cinq produits.

## Cause Racine

Pour prouver qu'un éditeur ne pouvait pas supprimer un produit, la suite
envoyait un DELETE sur un produit réel du catalogue. Le jour où les droits de
l'éditeur ont été élargis à `products:write`, le DELETE a légitimement
réussi — et le test venait de détruire une donnée de production.

Le test était destructif par construction, et sa vérification l'était aussi :
il se fiait au code HTTP, alors que PostgREST renvoie `200` avec un corps
vide pour un DELETE refusé, strictement identique à un DELETE réussi. Même
en comptant les lignes affectées, on n'aurait rien su de plus : la seule
source de vérité est l'état de la table après l'opération.

## Solution

Le produit a été restauré depuis le seed et le catalogue revérifié à
6 produits. La suite a été réécrite autour d'un produit jetable dédié,
`sonde-permissions`, à vérifier l'état de la base *après coup* plutôt que le
code HTTP, et à ne plus jamais toucher de vraies lignes. La même réécriture a
été appliquée aux sondes de commande (`TEST-AUTH-1`, `TEST-AUTH-2`).

## Prévention

Un test de sécurité ne doit jamais opérer sur de la donnée réelle. Il crée
ses propres fixtures et ne supprime que celles-ci. Les assertions lisent l'état
de la base après l'opération, jamais le statut HTTP renvoyé par PostgREST.

Un test qui échoue est acceptable ; un test qui casse la production ne l'est
pas. En cas de doute sur la fixtures, préférer un jeu temporaire à une donnée
existante — le coût d'une ligne ajoutée est nul, celui d'une ligne perdue
n'est pas réparable par le test.
