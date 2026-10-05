# Tâche : Documentation des variables d'environnement

## Détails
- **Date** : 04-10-2026-00-38
- **Statut** : Complétée

## Description

Les variables d'environnement exigées par le projet sont documentées avec leur
moment d'évaluation, les fichiers qui les lisent et une note de sécurité.
L'écran d'erreur de l'administration nomme désormais la variable manquante au
lieu d'échouer de façon générique.

## Actions

1. **`.env.example`** :
   - Réécrit sous forme de tableau : variable, moment (build ou runtime),
     fichiers qui l'utilisent, note de sécurité.
   - Le moment d'évaluation est la colonne la plus importante : les
     `NEXT_PUBLIC_*` sont figées au build, les saisir dans Coolify puis
     redémarrer ne produit aucun changement.

2. **Écran d'erreur** :
   - `missingEnvVars: string[]` ajouté à `src/lib/supabase.ts`.
   - La liste est remontée et affichée dans `src/app/admin/page.tsx` : la
     variable absente est nommée, pas devinée.

3. **Durcissement** :
   - Une version antérieure de cet écran collait l'URL réelle du projet et la
     clé publiable à titre d'exemple.
   - Les deux ont été retirées et remplacées par des placeholders génériques,
     puis le contrôle a été refait par `grep` sur `src/`.

4. **Variable seulement** :
   - Le commanditaire colle les vraies valeurs dans Coolify.
   - Rien n'est écrit en dur dans le dépôt.

## Vérification

Deux builds volontaires : un avec les variables fournies en ligne, un sans. Les
deux réussissent. La clé n'apparaît dans `.next/static/chunks/` que dans le
premier cas, ce qui prouve directement qu'elle est figée au moment du build et
non lue au démarrage. Commit `57fdd7e`.