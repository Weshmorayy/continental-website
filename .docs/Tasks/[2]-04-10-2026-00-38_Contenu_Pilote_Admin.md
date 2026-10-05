# Tâche : Contenu piloté par le portail

## Détails
- **Date** : 04-10-2026-00-38
- **Statut** : Complétée

## Description

57 blocs de contenu répartis sur 9 emplacements remplacent les textes figés
dans le code des sections principales du site. Modifier un titre ou l'image
d'une section se fait désormais dans le portail : aucune édition de code, aucun
redéploiement.

## Actions

1. **Table `content_blocks`** :
   - Colonnes : `slot`, `key`, `eyebrow`, `title`, `subtitle`, `body`, `meta`,
     `cta_label`, `cta_href`, `image`, `image_alt`, `icon`, `num`, `data`
     (JSONB), `position`, `active`.
   - `slot` désigne la section, `key` l'emplacement dans la section. Ajouter un
     emplacement est une donnée, pas une modification de code.

2. **Passerelle** :
   - `src/lib/atelier.ts` est le point d'accès unique au contenu.
   - Aucun composant n'importe le client Supabase pour lire du contenu : les
     composants ignorent d'où viennent les données, ce qui permet de brancher
     l'administration sans les réécrire.

3. **Trois canaux** :
   - Essai dans l'ordre : Supabase, puis l'API Atelier multi-clients, puis les
     fichiers du dépôt. Chaque canal a son repli, donc un contenu distant
     injoignable ne fait jamais échouer le build.
   - `getSiteProducts()` retourne le canal réellement utilisé (`source`), et le
     portail l'affiche : un site qui sert du contenu périmé sans le dire est
     impossible à diagnostiquer.

4. **Révision** :
   - ISR avec `revalidate: 60`.
   - La première requête après expiration sert le contenu périmé et déclenche
     une reconstruction en arrière-plan : il faut donc une seconde requête
     pour voir la modification.

## Vérification

Le nombre de blocs a été compté en base, emplacement par emplacement, et
confronté aux 9 slots attendus. Les pages ont ensuite été rechargées et leur
HTML contrôlé : elles portent bien le contenu venu de la base, et non celui
des fichiers du dépôt.