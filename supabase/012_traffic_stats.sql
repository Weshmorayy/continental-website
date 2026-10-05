-- =============================================================================
-- 012_traffic_stats.sql — Statistiques de site (et non seulement commandes)
-- =============================================================================
-- Pourquoi ce fichier existe
-- -------------------------
-- La table `site_events` et la fonction `record_event()` existaient depuis
-- 001_schema.sql, et `StatsTab` lisait déjà `public_daily_stats`. Malgré cela,
-- `site_events` contenait ZÉRO ligne : le compteur n'avait jamais rien écrit.
--
-- Cause exacte : `PageView.tsx` utilisait `navigator.sendBeacon()` vers
-- l'endpoint PostgREST. `sendBeacon` ne permet pas de poser d'en-tête HTTP, et
-- PostgREST exige `apikey`. Chaque envoi partait donc en 401 « No API key found
-- in request », silencieusement — `sendBeacon` renvoie `true` dès la mise en
-- file d'attente, donc le repli `supabase.rpc()` n'était jamais atteint.
--
-- Deuxième trou : `bump_product_views()` existe, `products.views` existe, et
-- aucun appelant dans le site. Le compteur de vues produit était donc à 0.
--
-- Ce fichier ne « corrige » pas le JavaScript : il ouvre la source de données
-- nécessaire aux statistiques d'audience. Le correctif client est dans
-- `src/components/PageView.tsx` et `src/app/produit/[slug]/page.tsx`.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. record_event() accepte une source de trafic
-- -----------------------------------------------------------------------------
-- Le paramètre est ajouté AVEC VALEUR PAR DÉFAUT : l'appel à deux arguments
-- `record_event('page_view', '/')` reste valide, aucune rupture de contrat.
--
-- Vie privée : on ne stocke PAS l'URL de provenance. Un référent contient
-- couramment des identifiants dans sa chaîne de requête (jetons de partage,
-- paramètres de campagne contenant un e-mail, identifiants de session). Seul le
-- NOM D'HÔTE est conservé, et les chemins entrants du site sont regroupés sous
-- la valeur « direct ». Ce qui part dans Supabase tient en une liste d'hôtes
-- connus : google.com, l.facebook.com, whatsapp.com…

CREATE OR REPLACE FUNCTION public.record_event(
  p_event text,
  p_path  text        DEFAULT NULL,
  p_meta  jsonb       DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  INSERT INTO public.site_events (event, path, meta)
  VALUES (
    left(p_event, 40),
    left(p_path, 200),
    -- On ne conserve que la source, jamais la requête ni l'URL complète.
    -- Un référent vide = visite directe (navigation, lien en favori, SMS).
    jsonb_build_object(
      'src', left(coalesce(p_meta ->> 'src', ''), 60)
    )
  );
$function$;

COMMENT ON FUNCTION public.record_event(text, text, jsonb) IS
  'Enregistre un événement de visite. Ne stocke que le nom d''hôte du référent.';

GRANT EXECUTE ON FUNCTION public.record_event(text, text, jsonb) TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 2. Vue d'audience : une ligne par (jour, chemin, source)
-- -----------------------------------------------------------------------------
-- Agrégée côté base pour ne transporter qu'un compteur : le navigateur reçoit
-- une dizaine de lignes au lieu de plusieurs milliers d'événements bruts. C'est
-- aussi la raison pour laquelle cette vue est lisible par `anon` : une vue
-- Postgres s'exécute avec les droits de son propriétaire, donc elle ne peut
-- contenir que des agrégats, jamais une ligne individuellement identifiable.

CREATE OR REPLACE VIEW public.public_traffic AS
SELECT
  e.day,
  coalesce(nullif(e.path, ''), '/')             AS path,
  coalesce(nullif(e.meta ->> 'src', ''), 'direct') AS source,
  count(*)::integer                              AS views
FROM public.site_events e
WHERE e.event = 'page_view'
GROUP BY 1, 2, 3;

COMMENT ON VIEW public.public_traffic IS
  'Pages vues agrégées par jour, chemin et source de trafic. Aucune donnée personnelle.';

GRANT SELECT ON public.public_traffic TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 3. Vue « produits les plus consultés »
-- -----------------------------------------------------------------------------
-- `products.views` est un compteur cumulé, mis à jour par `bump_product_views()`.
-- Cette vue le rend lisible publiquement SANS exposer le reste de la table :
-- nom, image, prix et stock restentderrière les politiques RLS de `products`.

CREATE OR REPLACE VIEW public.public_product_views AS
SELECT
  p.slug,
  p.name,
  p.views,
  p.category_id
FROM public.products p
WHERE p.is_active = true
  AND p.views > 0;

COMMENT ON VIEW public.public_product_views IS
  'Classement des produits par vues cumulées. Ni prix, ni description, ni stock.';

GRANT SELECT ON public.public_product_views TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 4. Purge de la table brute
-- -----------------------------------------------------------------------------
-- `site_events` est en écriture à chaque changement de page : sans purge elle
-- grossit indéfiniment. 90 jours d'historique brut suffisent à l'historique
-- visible dans l'admin, qui ne montre que 30 jours. À appeler depuis un job
-- planifié (pg_cron côté Supabase, ou un cron Coolify) :
--
--   select public.prune_site_events();
--
-- Les vues d'agrégation sont recalculées à la volée : purger la table brute ne
-- supprime aucun chiffre déjà présenté à l'admin, uniquement les lignes de plus
-- de 90 jours.

CREATE OR REPLACE FUNCTION public.prune_site_events(p_keep_days integer DEFAULT 90)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  removed integer;
BEGIN
  DELETE FROM public.site_events
  WHERE created_at < now() - make_interval(days => greatest(p_keep_days, 1));
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed;
END;
$function$;

-- Volontairement NON accordée à anon : la purge est un travail de
-- maintenance. Le REVOKE correspondant est en section 5 — sans lui, la
-- concession ci-dessous ne fermerait rien, car Supabase l'accorde d'office.
GRANT EXECUTE ON FUNCTION public.prune_site_events(integer) TO postgres, service_role;

-- ---------------------------------------------------------------------------
-- 5. Deux corrections que la première application a révélées
-- ---------------------------------------------------------------------------
-- 5.1 `CREATE OR REPLACE` NE REMPLACE PAS une fonction dont la liste d'arguments
--     change : Postgres y voit une fonction NOUVELLE et conserve l'ancienne.
--     Résultat, PostgREST trouvait deux candidats pour
--     `record_event('page_view','/')` et répondait 300 « Multiple (or no)
--     matching functions » — y compris pour l'appel à deux arguments, qui
--     fonctionnait parfaitement avant ce fichier.
--     L'ancien prototype est donc supprimé : l'appel à deux arguments est
--     désormais servi par la version à trois arguments, grâce à sa valeur par
--     défaut. Sans ce DROP, le compteur de visites reste muet.
--
-- 5.2 Sur Supabase, `pg_default_acl` accorde EXECUTE à `anon`, `authenticated`
--     et `service_role` sur TOUTE fonction créée par le rôle `postgres`. Ce n'est
--     donc pas seulement PUBLIC qu'il faut retirer : sans ces REVOKE, n'importe
--     quel visiteur du site — sans aucun compte — pouvait purger tout
--     l'historique de trafic en appelant la fonction.
--
--     Vérification dans le tableau.default : `{postgres=X/postgres,
--     anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}` pour
--     defaclobjtype = 'f'. C'est ce défaut qui a fait échouer une première
--     application, où un simple `REVOKE … FROM PUBLIC` n'a rien changé.
--
--     `bump_product_views()` reste volontairement exécutable par anon : compter
--     une vue de fiche produit n'exige aucun compte, c'est tout l'intérêt.

DROP FUNCTION IF EXISTS public.record_event(text, text);

REVOKE EXECUTE ON FUNCTION public.prune_site_events(integer) FROM PUBLIC, anon, authenticated;