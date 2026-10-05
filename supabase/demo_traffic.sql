-- =============================================================================
-- demo_traffic.sql — Jeu de trafic de DÉMONSTRATION (20 jours)
-- =============================================================================
-- ⚠ À N'EXÉCUTER QUE POUR ESSAYER L'ÉCRAN « Statistiques ».
--
-- Ce fichier INVENTE des visites. Il n'a rien à voir avec une audience réelle
-- et ne doit jamais être lancé sur une base qui sert un vrai site : les
-- chiffres affichés dans l'administration seraient alors faux, et personne ne
-- sa où ils viennent.
--
-- Il a servi à vérifier que la chaîne complète fonctionne : écriture par
-- `record_event()`, agrégation par `public_traffic`, courbe à 30 jours, pages
-- les plus consultées, sources de trafic, produits les plus vus.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- Pour l'annuler complètement :
--
--     DELETE FROM public.site_events WHERE day < CURRENT_DATE;
--     UPDATE public.products SET views = 0;
--
-- La seconde ligne est indispensable : `products.views` est un compteur
-- CUMULÉ, alimenté par `bump_product_views()`. Les lignes de la table
-- d'événements peuvent être effacées, mais un compteur cumulé ne sait pas
-- remonter le temps. Sans cette remise à zéro, le classement « produits les
-- plus consultés » garderait des nombres qui n'ont plus aucune source.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- Ce que la démonstration ne couvre PAS
-- --------------------------------------
--   • lesateurs réels (l'écran affiche « direct » partout) ;
--   • la conversion, faute de commandes ;
--   • les promotions avec dates : une campagne à venir est impossible à
--     vérifier avec ce jeu, puisque les dates sont calculées sur l'intervalle
--     passé.
-- =============================================================================

BEGIN;

INSERT INTO public.site_events (event, path, meta, day)
SELECT
  'page_view',
  (ARRAY[
    '/', '/catalogue', '/', '/catalogue', '/',
    '/produit/tv-smart-ct-43sr', '/', '/catalogue',
    '/produit/ventilateur-sur-pied-16-fs40-1688',
    '/produit/climatiseur-split-inverter',
  ])[1 + (i % 10)],
  jsonb_build_object('src', (ARRAY[
    'direct', 'direct', 'l.facebook.com', 'google.com',
    'direct', 'direct', 'direct', 'm.facebook.com',
    'direct', 'google.com',
  ])[1 + (i % 10)]),
  CURRENT_DATE - ((i / 6)::int)
FROM generate_series(0, 119) AS g(i);

-- Les compteurs cumulés de fiche produit suivent la même démonstration.
UPDATE public.products p
   SET views = s.n
  FROM (
    SELECT slug, 18 AS n FROM products WHERE slug = 'ventilateur-sur-pied-16-fs40-1688'
    UNION ALL SELECT slug, 11 FROM products WHERE slug = 'climatiseur-split-inverter'
    UNION ALL SELECT slug,  7 FROM products WHERE slug = 'tv-smart-ct-43sr'
    UNION ALL SELECT slug,  5 FROM products WHERE slug = 'ventilateur-mural-16-fb-40rc'
  ) AS s
 WHERE p.slug = s.slug;

COMMIT;

-- Vérification attendue : 120 événements répartis sur 20 jours.
SELECT count(*) AS evenements, count(DISTINCT day) AS jours FROM public.site_events;