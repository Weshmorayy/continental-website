# Tâche : Pages internes pilotées par l'administration

## Détails
- **Date** : 04-10-2026-00-38
- **Statut** : Complétée

## Description

Les pages À propos, Garantie et Contact lisent désormais leur texte dans les
blocs de contenu — 41 blocs au total. Leur texte d'origine est conservé en
repli : un bloc absent dégrade la page vers sa version d'origine au lieu de la
casser.

## Actions

1. **Câblage** :
   - Chaque page appelle `getBlocks('<slot>')` avec son propre emplacement.
   - Les blocs sont indexés par `key` via un petit helper
     `text(key, field, fallback)` : une seule ligne de lecture par chaîne à
     afficher, avec son repli.
   - Le helper reste local à sa page. Un helper partagé imposerait aux trois
     pages le même texte d'origine, ce qui n'a aucun sens.

2. **Blocs** :
   - `a-propos` : 12 blocs.
   - `garantie` : 12 blocs.
   - `contact` : 17 blocs.
   - Total 41 blocs, tous modifiables depuis le portail et tous supprimables :
     aucun n'est nécessaire pour que la page s'affiche.

3. **Prudence** :
   - Le repli est le vrai JSX d'origine, jamais un texte inventé.
   - Une première version avait écrit des titres plausibles mais absents du
     code, comme « Parlons de votre besoin. » : ils ont dû être corrigés contre
     la source réelle avant d'être livrés.
   - L'erreur est asymétrique et c'est pour cela qu'elle a été rattrapée : un
     texte d'origine absent de la base ne se voit pas, un texte inventé se voit
     immédiatement sur le site.

## Vérification

Chaque page a été rechargée et son texte rendu comparé aux blocs présents en
base, chaîne par chaîne. La comparaison a été faite sur le rendu servi, pas
sur la source : c'est le rendu qui dit ce que le visiteur voit.