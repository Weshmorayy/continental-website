-- =============================================================================
-- CONTINENTAL® — Contenu éditorial, journal, permissions
-- 005_content.sql — À exécuter APRÈS 002_rls.sql.
-- =============================================================================
-- Trois ajouts, tous issus de la demande initiale :
--
--   1. content_blocks — rend chaque texte et chaque image du site public
--      modifiable depuis l'administration. Le design ne bouge pas ; seule la
--      source des données change.
--
--   2. audit_events   — le journal : qui a modifié quoi, et quand.
--
--   3. site_admins.permissions — autorisations par module, pour qu'un compte
--      puisse gérer le catalogue sans voir les commandes des clients.
-- =============================================================================


-- ───────────────────────────────────────────────────────── blocs de contenu ──
-- Un tableau générique plutôt qu'une colonne par section. Ajouter une nouvelle
-- zone de texte sur le site ne demande ni migration ni changement de code :
-- une ligne suffit.
--
-- slot = la section d'affichage ('hero', 'gammes', 'engagements'…)
-- key  = l'emplacement précis dans cette section ('gamme-1', 'engagement-2')
CREATE TABLE IF NOT EXISTS public.content_blocks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot       TEXT NOT NULL,
  key        TEXT NOT NULL,

  eyebrow    TEXT,
  title      TEXT,
  subtitle   TEXT,
  body       TEXT,
  meta       TEXT,
  cta_label  TEXT,
  cta_href   TEXT,
  image      TEXT,
  image_alt  TEXT,
  -- Nom d'icône lucide-react. Texte et non référence : le nom est une
  -- donnée éditoriale, pas une décision de mise en page.
  icon       TEXT,
  num        TEXT,

  -- Champs propres à une section, sans multiplier les colonnes.
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,

  position   INTEGER NOT NULL DEFAULT 0,
  active     BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT content_blocks_slot_key UNIQUE (slot, key)
);

CREATE INDEX IF NOT EXISTS content_blocks_slot_idx
  ON public.content_blocks (slot, active, position);


-- ───────────────────────────────────────────────────────────────── journal ──
-- En ajout seul : ni modification, ni suppression, même par le propriétaire.
-- Un journal que l'on peut réécrire ne prouve plus rien.
CREATE TABLE IF NOT EXISTS public.audit_events (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_email TEXT,
  actor_role  TEXT,
  action      TEXT NOT NULL,        -- create · update · delete · login …
  entity      TEXT NOT NULL,        -- products · banners · orders …
  entity_id   TEXT,
  label       TEXT,                 -- nom lisible (« Ventilateur 16 pouces »)
  meta        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_events_created_idx ON public.audit_events (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_events_actor_idx   ON public.audit_events (actor_email);
CREATE INDEX IF NOT EXISTS audit_events_entity_idx  ON public.audit_events (entity);

-- Journalisation en ajout seul, y compris pour le propriétaire.
CREATE OR REPLACE FUNCTION public.audit_events_immutable() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_events est en ajout seul (tentative % sur %)', TG_OP, TG_TABLE_NAME;
END $$;

DROP TRIGGER IF EXISTS audit_events_no_mutate ON public.audit_events;
CREATE TRIGGER audit_events_no_mutate
  BEFORE UPDATE OR DELETE OR TRUNCATE ON public.audit_events
  FOR EACH STATEMENT EXECUTE FUNCTION public.audit_events_immutable();


-- ─────────────────────────────────────────────────────────── journalisation ──
-- Appelée par l'application dans la MÊME transaction que la mutation : si
-- l'écriture echoue, la ligne de journal disparait avec elle. Un journal
-- qui affirme avoir enregistre un changement qui n'a pas eu lieu est pire
-- qu'un journal muet.
CREATE OR REPLACE FUNCTION public.log_event(
  p_action    TEXT,
  p_entity    TEXT,
  p_entity_id TEXT DEFAULT NULL,
  p_label     TEXT DEFAULT NULL,
  p_meta      JSONB  DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Seuls les comptes administrateurs alimentent le journal : une commande
  -- client laisserait des lignes sans auteur identifiable.
  IF NOT public.is_site_admin() THEN
    RETURN;
  END IF;

  INSERT INTO public.audit_events
    (actor_email, actor_role, action, entity, entity_id, label, meta)
  VALUES (
    lower(coalesce(auth.jwt() ->> 'email', '')),
    coalesce(auth.jwt() ->> 'role', ''),
    p_action, p_entity, p_entity_id, p_label, p_meta
  );
END $$;

REVOKE ALL ON FUNCTION public.log_event(TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_event(TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated;


-- ──────────────────────────────────────────────────────────── permissions ──
-- Autorisations par module. `NULL` = tous les droits (comportement d'un
-- administrateur). Un objet explicite = liste blanche.
--
--   {"orders":"read","products":"read,write"}
--
-- Un module absent vaut refus, jamais élévation : une faute de frappe sur un
-- nom de module ne doit pas ouvrir un droit.
ALTER TABLE public.site_admins
  ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Lecture de ses propres droits.
CREATE OR REPLACE FUNCTION public.my_permissions()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(a.permissions, '{}'::jsonb)
    FROM public.site_admins a
   WHERE lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
   LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.my_permissions() TO authenticated;
-- =============================================================================


-- ═══════════════════════════════════════════════════════════════ policies ════
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;

-- Lecture publique : uniquement les blocs marqués actifs. Un bloc en brouillon
-- ne doit jamais apparaître sur le site — même par hasard, même brièvement.
DROP POLICY IF EXISTS blocks_public_read ON public.content_blocks;
CREATE POLICY blocks_public_read ON public.content_blocks
  FOR SELECT TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS blocks_admin_all ON public.content_blocks;
CREATE POLICY blocks_admin_all ON public.content_blocks
  FOR ALL TO authenticated
  USING (public.is_site_admin())
  WITH CHECK (public.is_site_admin());

-- ── journal ──
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- ⚠ AUCUNE politique pour `anon` : le journal liste qui a modifié quoi. Le
--   publier reviendrait à annoncer la feuille de route du back-office.
DROP POLICY IF EXISTS audit_admin_read ON public.audit_events;
CREATE POLICY audit_admin_read ON public.audit_events
  FOR SELECT TO authenticated
  USING (public.is_site_admin());

-- Aucune politique INSERT : l'insertion passe par `log_event()`, en
-- SECURITY DEFINER, et uniquement si `is_site_admin()`. On ne peut donc pas
-- fabriquer une ligne de journal mensongère depuis le navigateur.

-- ── réinitialisation du journal ──
-- Nécessaire après `ALTER TABLE … ADD COLUMN` : la politique précédente
-- uit le rôle porteur et ne couvre pas encore la nouvelle colonne.
DROP POLICY IF EXISTS admins_update ON public.site_admins;
CREATE POLICY admins_update ON public.site_admins
  FOR UPDATE TO authenticated
  USING (public.is_site_owner())
  WITH CHECK (public.is_site_owner());

GRANT SELECT ON public.content_blocks TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_blocks TO authenticated;
GRANT SELECT ON public.audit_events TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.audit_events_id_seq TO authenticated;
-- =============================================================================


-- ════════════════════════════════════════════════════════════ statistiques ══
-- Enregistrement d'une visite. Ouverte au public, comme un formulaire :
-- c'est le seul point d'écriture accessible sans compte, et il n'accepte que
-- un nom d'événement et un chemin.
--
-- ⚠ ON NE PEUT PAS PLONGER ICI une adresse IP, un identifiant de session ou
--   une empreinte : le Visitor Tracking Id entrant (même salé) ferait de la
--   table `site_events` un fichier de suivi, ce que la loi sur les données
--   personnelles n'autorise pas sans consentement. Le compteur reste donc
--   volontairement grossier — et c'est un choix, pas une économie.
CREATE OR REPLACE FUNCTION public.record_event(
  p_event TEXT,
  p_path  TEXT DEFAULT NULL
) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.site_events (event, path)
  VALUES (left(p_event, 40), left(p_path, 200));
$$;

GRANT EXECUTE ON FUNCTION public.record_event(TEXT, TEXT) TO anon, authenticated;
-- =============================================================================
