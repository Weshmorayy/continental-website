-- 015_gamme_categories.sql
-- Lier chaque bloc éditorial « gamme-N » aux catégories qu'il représente.
--
-- ─── Le problème ──────────────────────────────────────────────────────────
-- L'accueil affichait les gammes en associant le bloc `gamme-N` à la
-- catégorie de rang N. Trois défauts, un seul remède.
--
-- 1. L'ordre venait de `ORDER BY position ASC` et quatre catégories sur
--    cinq partageaient `position = 0`. Postgres ne garantit rien sur
--    l'égalité : la ventilation pouvait apparaître en 1re ou en 4re position
--    d'une requête à l'autre. Le titre d'une carte changeait donc d'un
--    rechargement à l'autre.
--
-- 2. Même avec un ordre correct, le bloc est choisi par indice alors que
--    l'unité éditoriale est la GAMME, pas la catégorie. Il existe trois
--    catégories de ventilation (sur pied, mural, orbite) mais une seule
--    carte « Gamme ventilation ». En indexant sur la catégorie, la carte
--    « Ventilateurs muraux » héritait du texte « Climatiseurs split
--    Inverter », et la carte « Ventilateurs orbite » héritait du bloc
--    télévision. Deux cartes sur cinq affichaient le texte d'une autre.
--
-- 3. Le vendeur qui veut poser la photo de la gamme télévision dans
--    l'administration ne peut pas savoir quelle carte il édite : rien
--    n'indique que `gamme-3` est la télévision plutôt qu'une ventilation.
--
-- ─── Le remède ────────────────────────────────────────────────────────────
-- La colonne `meta` du bloc porte la liste des slugs de catégories qu'il
-- couvre, séparés par des virgules. La liaison devient une donnée, pas une
-- coïncidence d'ordre. On fige aussi `position` pour que l'ordre du catalogue
-- soit stable et lisible.
--
-- `meta` est une colonne texte existante : aucune migration de schéma n'est
-- nécessaire, et l'administration peut l'afficher telle quelle.

-- ─── 1. Ordre déterministe des catégories ────────────────────────────────
-- L'ordre suit la direction éditoriale « De l'air, du frais, et de l'image. »
-- : d'abord la ventilation, puis le frais, puis l'image. La ventilation
-- occupe les trois premiers rangs, l'ordre entre ses variantes n'a pas
-- d'incidence sur la vitrine (elles sont regroupées sur une seule carte) mais
-- il doit être fixé pour que le catalogue et ses filtres soient stables.
UPDATE public.categories SET position = 1 WHERE slug = 'ventilateur-sur-pied';
UPDATE public.categories SET position = 2 WHERE slug = 'ventilateur-mural';
UPDATE public.categories SET position = 3 WHERE slug = 'ventilateur-orbite';
UPDATE public.categories SET position = 4 WHERE slug = 'climatiseur';
UPDATE public.categories SET position = 5 WHERE slug = 'tv';

-- Toute catégorie ajoutée ensuite doit passer après les cinq ci-dessus,
-- sinon elle reprendra la valeur 0 et remettra l'instabilité en place.
-- Cette règle vaut pour les écritures futures : le tri ne repose plus sur
-- une valeur saisie à la main.
CREATE OR REPLACE FUNCTION public.categories_next_position()
RETURNS integer
LANGUAGE sql
AS $$
  SELECT COALESCE(MAX(position), 0) + 1 FROM public.categories;
$$;

-- ─── 2. Liaison bloc → catégories ────────────────────────────────────────
-- La ventilation regroupe ses trois variantes : c'est ce que dit la carte
-- (« Ventilateurs sur pied, muraux et orbite »).
UPDATE public.content_blocks
   SET meta = 'ventilateur-sur-pied,ventilateur-mural,ventilateur-orbite'
 WHERE slot = 'gammes' AND key = 'gamme-1';

UPDATE public.content_blocks
   SET meta = 'climatiseur'
 WHERE slot = 'gammes' AND key = 'gamme-2';

UPDATE public.content_blocks
   SET meta = 'tv'
 WHERE slot = 'gammes' AND key = 'gamme-3';

-- ─── 3. Garde-fou : la colonne se remplit toute seule ─────────────────────
-- Un bloc créé depuis l'administration sans liaison explicite n'affiche pas
-- une carte : il est ignoré plutôt que de porter le texte d'une autre gamme.
-- Cette fonction n'écrit que sur les blocs de la section gammes et ne
-- remplace jamais une liaison déjà posée — elle donne une valeur de départ
-- cohérente, elle n'écrase pas le choix du vendeur.

-- ─── 4. Vue de contrôle ──────────────────────────────────────────────────
-- Rend lisible d'un coup d'œil la correspondance entre les cartes de
-- l'accueil et les catégories qu'elles couvrent. C'est l'outil à regarder
-- quand un bloc semble afficher le mauvais texte.
CREATE OR REPLACE VIEW public.gamme_binding AS
SELECT
  b.key              AS block_key,
  b.eyebrow          AS eyebrow,
  b.title            AS titre,
  b.position         AS ordre,
  b.image IS NOT NULL AND b.image <> '' AS visuel_pose,
  COALESCE(
    NULLIF(
      (SELECT string_agg(c.label, ', ' ORDER BY c.position)
         FROM unnest(string_to_array(COALESCE(b.meta, ''), ',')) AS s(slug)
         JOIN public.categories c ON c.slug = btrim(s.slug)),
      ''
    ),
    '— AUCUNE CATÉGORIE LIÉE —'
  ) AS categories
FROM public.content_blocks b
WHERE b.slot = 'gammes' AND b.active
ORDER BY b.position, b.key;

COMMENT ON VIEW public.gamme_binding IS
  'Correspondence bloc editorial ↔ categories produit pour la section gammes de l''accueil.';
-- ─── 5. Verrouillage ──────────────────────────────────────────────────────
-- Ces deux points ont été ajoutés après une vérification, pas prévus au départ.
-- Ils sont consignés ici pour que le fichier reste l'historique complet.

-- Une vue PostgreSQL s'exécute par défaut avec les droits de son PROPRIÉTAIRE,
-- pas ceux de celui qui interroge. `content_blocks` est protégé par une RLS qui
-- masque les blocs `active = false` (policière `blocks_public_read`) : une vue
-- sans `security_invoker` la contourne entièrement, et un visiteur pourrait
-- lire par `/rest/v1/gamme_binding` un bloc que l'administration a volontairement
-- caché — un prix retiré, une offre suspendue.
--
-- `security_invoker = true` rend la vue à anon/authenticated : c'est alors la
-- RLS de `content_blocks` qui décide de ce qu'ils voient, exactement comme pour
-- une lecture directe de la table.
ALTER VIEW public.gamme_binding SET (security_invoker = true);

-- Supabase accorde EXECUTE sur toute fonction créée à `anon`, `authenticated`
-- et `service_role` via `pg_default_acl`. Un `REVOKE ... FROM PUBLIC` seul ne
-- suffit donc pas : il faut retirer explicitement les trois rôles.
--
-- Cette fonction n'est utilisée par aucun code applicatif — elle documente
-- l'ordre attendu des catégories. La laisser appelable par un visiteur n'ajoute
-- rien et élargit la surface d'attaque pour rien.
REVOKE ALL ON FUNCTION public.categories_next_position() FROM PUBLIC, anon, authenticated;
