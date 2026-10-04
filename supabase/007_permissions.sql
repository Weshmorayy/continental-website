-- =============================================================================
-- CONTINENTAL® — RLS conscient des droits par module
-- 007_permissions.sql — À exécuter APRÈS 005_content.sql.
-- =============================================================================
-- ⚠ POURQUOI CE FICHIER EXISTE.
--
--   Jusque-là, la politique d'administration était `USING (is_site_admin())` :
--   elle ignorait totalement la colonne `permissions`. Les droits n'étaient
--   donc appliqués que par l'INTERFACE — un bouton caché. Un collaborateur
--   pouvait très bien appeler l'API directement et lire les commandes de tous
--   les clients, ou vider le catalogue.
--
--   Masquer un bouton n'est pas une autorisation. Elle doit être appliquée par
--   la base, au moment de la lecture, sinon c'est une illusion.
--
--   Chaque table est désormais adossée à UN module nommé. La fonction
--   `can_module()` lit la liste réellement enregistrée pour le compte
--   connecté et tranche. Un module non accordé vaut refus.
-- =============================================================================


-- ─────────────────────────────────────────────────── correspondance ─────────
-- table            → module de la liste des droits
CREATE OR REPLACE FUNCTION public.module_of(p_table text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE p_table
    WHEN 'products'        THEN 'products'
    WHEN 'categories'      THEN 'products'
    WHEN 'banners'         THEN 'banners'
    WHEN 'faqs'            THEN 'faq'
    WHEN 'shipping_zones'  THEN 'shipping'
    WHEN 'content_blocks'  THEN 'content'
    WHEN 'media'           THEN 'media'
    WHEN 'site_backups'    THEN 'backups'
    WHEN 'orders'          THEN 'orders'
    WHEN 'leads'           THEN 'leads'
    WHEN 'site_settings'   THEN 'settings'
    ELSE NULL
  END;
$$;


-- ─────────────────────────────────────────────────────────── décision ─────────
-- `SECURITY DEFINER` : la fonction doit lire `site_admins`, que la politique
-- de cette table réserve aux administrateurs. Sans cela, un collaborateur
-- n'obtiendrait jamais ses propres droits — et verrait un site vide.
CREATE OR REPLACE FUNCTION public.can_module(
  p_table  TEXT,
  p_need   TEXT DEFAULT 'read'
) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    -- module inconnu : aucune politique ne s'appliquera, donc refus
    WHEN public.module_of(p_table) IS NULL THEN false

    ELSE EXISTS (
      SELECT 1 FROM public.site_admins a
       WHERE lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
         AND (
              -- l'agence passe partout, sans avoir à cocher des cases
              a.role = 'admin'
              -- sinon, accord explicite. 'write' implique 'read' :
              -- on n'écrit pas sans avoir lu.
           OR CASE WHEN p_need = 'write'
                   THEN coalesce(a.permissions ->> public.module_of(p_table), '') LIKE '%write%'
                   ELSE coalesce(a.permissions ->> public.module_of(p_table), '') <> ''
              END
         )
    )
  END;
$$;

REVOKE ALL ON FUNCTION can_module(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION can_module(TEXT, TEXT) TO authenticated;


-- ══════════════════════════════════════ politiques par module ══════════════
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'products', 'categories', 'banners', 'faqs', 'shipping_zones',
    'content_blocks', 'media', 'site_backups', 'orders', 'leads'
  ] LOOP

    -- lecture
    EXECUTE format('DROP POLICY IF EXISTS mod_read ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY mod_read ON public.%I FOR SELECT TO authenticated
         USING (public.can_module(%L, ''read''))', t, t);

    -- écriture
    EXECUTE format('DROP POLICY IF EXISTS mod_write ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY mod_write ON public.%I FOR ALL TO authenticated
         USING      (public.can_module(%L, ''write''))
         WITH CHECK (public.can_module(%L, ''write''))', t, t, t);
  END LOOP;
END $$;

-- L'ancienne politique `admin_all` accordait l'accès complet à quiconque était
-- administrateur : elle neutraliserait tout ce qui précède. On la retire.
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'products', 'categories', 'banners', 'faqs', 'pages', 'shipping_zones',
    'site_settings', 'orders', 'leads', 'media', 'site_backups', 'site_events',
    'content_blocks'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS admin_all ON public.%I', t);
  END LOOP;
END $$;


-- ── réglages du site : l'agence, ou lecture seule elsewhere ──
-- Un collaborateur peut consulter les coordonnées pour travailler, mais
-- modifier le numéro de téléphone du client relève de l'agence.
DROP POLICY IF EXISTS settings_read ON public.site_settings;
CREATE POLICY settings_read ON public.site_settings
  FOR SELECT TO authenticated
  USING (public.is_site_admin());

DROP POLICY IF EXISTS settings_write ON public.site_settings;
CREATE POLICY settings_write ON public.site_settings
  FOR UPDATE TO authenticated
  USING      (public.can_module('settings', 'write'))
  WITH CHECK  (public.can_module('settings', 'write'));

-- ── journal : lecture réservée à l'agence ──
DROP POLICY IF EXISTS audit_admin_read ON public.audit_events;
CREATE POLICY audit_admin_read ON public.audit_events
  FOR SELECT TO authenticated
  USING (public.is_site_owner());

-- ── comptes : l'agence seule, et le propriétaire du rôle `admin` ──
DROP POLICY IF EXISTS admins_read ON public.site_admins;
CREATE POLICY admins_read ON public.site_admins
  FOR SELECT TO authenticated
  USING (public.is_site_owner());
-- =============================================================================
