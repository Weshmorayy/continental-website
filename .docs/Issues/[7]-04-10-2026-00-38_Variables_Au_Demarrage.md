# Issue : Des variables d'environnement lues au mauvais moment

## Détails
- **Date** : 05-10-2026-00-38
- **Statut** : Résolue

## Description

Le déploiement servait un site sans aucun contenu de base. Les variables
avaient bien été saisies dans Coolify, mais les ajouter puis redémarrer ne
changeait rien : le site restait vide, et rien n'indiquait pourquoi.

## Cause Racine

Les variables `NEXT_PUBLIC_*` sont substituées comme valeurs littérales dans
le bundle JavaScript compilé, au moment du BUILD. Elles ne sont pas relues à
l'exécution depuis l'environnement. Redémarrer un conteneur rejoue l'ancien
bundle avec les anciennes valeurs figées, quelle que soit la configuration
courante. Vérifié en cherchant la clé dans `.next/static/chunks/` : présente
quand les variables sont fournies au build, absente sinon.

Conséquence pratique : modifier la configuration d'un déploiement déjà
construit ne peut rien changer tant qu'un build n'a pas été refait. La
valeur qui compte n'est pas celle affichée par l'interface de Coolify, mais
celle inscrite dans le bundle effectivement servi au navigateur.

## Solution

Documenté dans `.env.example` que les trois variables Supabase sont évaluées
au build, et que Coolify exige un REDEPLOY — un nouveau build — et non un
redémarrage. L'écran d'erreur de l'admin a été durci : il nomme chaque
variable manquante, pour qu'un déploiement mal configuré dégénère en
diagnostic lisible plutôt qu'en page blanche. Les deux chemins de build ont
ensuite été testés de bout en bout.

## Prévention

Pour toute variable `NEXT_PUBLIC_*`, documenter le moment d'évaluation à côté
de son nom, et toujours vérifier la présence de la valeur dans le bundle
construit plutôt que dans `.env.local`.
