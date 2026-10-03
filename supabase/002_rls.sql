-- =============================================================================
-- CONTINENTAL® — Row Level Security
-- 002_rls.sql — À exécuter APRÈS 001_schema.sql.
-- =============================================================================
-- PRINCIPE
--   `anon`         = le visiteur du site public. Lecture du contenu publié,
--                    écriture d'une commande ou d'un formulaire. RIEN D'AUTRE.
--   `authenticated`= un compte Supabase Auth. Gère tout, MAIS seulement si son
--                    email figure dans `site_admins`. C'est cette table, et
--                    elle seule, qui décide — pas le rôle du JWT.
--
-- ⚠ CE QUI N'EXISTE PAS ICI N'EST PAS POSSIBLE.
--   Règle n°1 de PostgreSQL : en l'absence de politique applicable, l'accès
--   est refusé. C'est silencieux — pas d'erreur, zéro ligne. Une table sans
--   politique n'est donc pas « ouverte par défaut », elle est fermée.
--   De même, un UPDATE/DELETE filtré par RLS agit sur ZÉRO LIGNE sans lever
--   d'erreur : le code doit vérifier le nombre de lignes renvoyées, sinon il
--   annonce une réussite qui n'a pas eu lieu.
-- =============================================================================


-- ─────────────────────────────────────────────────────── qui administre ? ──
-- Fonction unique, pour que toutes les politiques Mesurent la même chose.
CREATE OR REPLACE FUNCTION public.is_site_admin()
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.site_admins a
     WHERE lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- `role = 'admin'` : peut gérer les comptes administrateurs eux-mêmes.
CREATE OR REPLACE FUNCTION public.is_site_owner()
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.site_admins a
     WHERE lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
       AND a.role = 'admin'
  );
$$;


-- ═══════════════════════════════════════════════ administrateurs ═══════════
ALTER TABLE public.site_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admins_read   ON public.site_admins;
CREATE POLICY admins_read ON public.site_admins
  FOR SELECT TO authenticated
  USING (public.is_site_admin());

-- Insérer ou supprimer un administrateur n'appartient qu'à un `admin`.
-- Sans `WITH CHECK`, il serait possible d'ajouter un compte « admin »
-- en se donnant soi-même `role = 'admin'` — c'est ce que la clause interdit.
DROP POLICY IF EXISTS admins_insert ON public.site_admins;
CREATE POLICY admins_insert ON public.site_admins
  FOR INSERT TO authenticated
  WITH CHECK (public.is_site_owner());

DROP POLICY IF EXISTS admins_update ON public.site_admins;
CREATE POLICY admins_update ON public.site_admins
  FOR UPDATE TO authenticated
  USING (public.is_site_owner())
  WITH CHECK (public.is_site_owner());

DROP POLICY IF EXISTS admins_delete ON public.site_admins;
CREATE POLICY admins_delete ON public.site_admins
  FOR DELETE TO authenticated
  USING (public.is_site_owner());


-- ═════════════════════════════════════════════ contenu public ═════════════
-- Lecture par le visiteur — UNIQUEMENT ce qui est effectivement publié.
-- Rien d'autre n'est lisible : ni brouillon, ni produit masqué, ni commande,
-- ni demande, ni journal.

-- ── produits : seuls ceux marqués `is_active` ──
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS products_public_read ON public.products;
CREATE POLICY products_public_read ON public.products
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- ── catégories ──
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS categories_public_read ON public.categories;
CREATE POLICY categories_public_read ON public.categories
  FOR SELECT TO anon, authenticated USING (true);

-- ── bannières : uniquement celles actives ──
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS banners_public_read ON public.banners;
CREATE POLICY banners_public_read ON public.banners
  FOR SELECT TO anon, authenticated
  USING (active = true);

-- ── zones de livraison ──
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS shipping_public_read ON public.shipping_zones;
CREATE POLICY shipping_public_read ON public.shipping_zones
  FOR SELECT TO anon, authenticated USING (true);

-- ── questions fréquentes ──
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS faqs_public_read ON public.faqs;
CREATE POLICY faqs_public_read ON public.faqs
  FOR SELECT TO anon, authenticated USING (true);

-- ── pages : uniquement les publiées ──
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pages_public_read ON public.pages;
CREATE POLICY pages_public_read ON public.pages
  FOR SELECT TO anon, authenticated
  USING (published = true);

-- ── réglages : une seule ligne, et c'est le paramétrage public du site ──
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS settings_public_read ON public.site_settings;
CREATE POLICY settings_public_read ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);


-- ═══════════════════════════════════════ écritures publiques (formulaires) ══
-- ── commandes : le visiteur passe commande ──
-- Insertion ouverte au public… MAIS `order_status` est forcé à 'new'. Sans
-- cette contrainte, un visiteur pourrait fabriquer une commande déjà livrée.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS orders_public_insert ON public.orders;
CREATE POLICY orders_public_insert ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (order_status = 'new' AND payment_status = 'pending');

-- ⚠ AUCUNE politique SELECT pour `anon`.
-- Le carnet des commandes contient nom, téléphone et adresse de clients réels :
-- le rendre lisible publiquement reviendrait à le diffuser. La page de
-- confirmation passe par `get_order_by_token` plus bas.

-- ── demandes (contact, devis, newsletter) ──
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS leads_public_insert ON public.leads;
CREATE POLICY leads_public_insert ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new');

-- ⚠ Aucune politique SELECT/UPDATE/DELETE pour `anon`.
-- Sans cela, un formulaire de contact se transforme en base interrogeable
-- à distance : il suffirait d'énumérer les emails Dakarois du pays.

-- ── statistiques : le visiteur enregistre une visite ──
ALTER TABLE public.site_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS events_public_insert ON public.site_events;
CREATE POLICY events_public_insert ON public.site_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Aucune lecture publique : les compteurs sont un outil d'analyse interne.


-- ═══════════════════════════════════════════ accès complet administrateur ══
-- Une seule politique par table : l'administration peut tout lire et tout
-- écrire, y compris ce que le public ne voit pas (brouillons, produits
-- inactifs, commandes, demandes). Elle exige `is_site_admin()`, donc un
-- compte Auth sans ligne dans `site_admins` n'obtient rien.
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'products', 'categories', 'banners', 'faqs', 'pages', 'shipping_zones',
    'site_settings', 'orders', 'leads', 'media', 'site_backups', 'site_events'
  ] LOOP
    -- `%I` cite l'IDENTIFIANT seul : on lui passe `t`, pas `public.t`.
    -- Passer 'public.' || t produit DROP POLICY … ON "public.products",
    -- c'est-à-dire une table nommée « public.products » — qui n'existe pas.
    EXECUTE format('DROP POLICY IF EXISTS admin_all ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY admin_all ON public.%I
         FOR ALL TO authenticated
         USING (public.is_site_admin())
         WITH CHECK (public.is_site_admin())', t);
  END LOOP;
END $$;


-- ══════════════════════════════════════ lecture d'UNE commande par jeton ════
-- Le client doit pouvoir consulter sa commande. Mais `anon` ne peut pas lire
-- `orders`. On passe donc par une fonction qui exige le jeton secret.
--
-- Elle ne renvoie QUE les champs utiles à l'affichage, et une seule ligne.
-- Pas de liste, pas de téléphone des autres clients.
CREATE OR REPLACE FUNCTION public.get_order_by_token(p_token UUID)
RETURNS TABLE (
  ref_command         TEXT,
  customer_name       TEXT,
  customer_phone      TEXT,
  order_status        order_status,
  payment_status      payment_status,
  payment_method      TEXT,
  subtotal            NUMERIC,
  shipping_cost       NUMERIC,
  total_amount        NUMERIC,
  shipping_zone_name  TEXT,
  items               JSONB,
  created_at          TIMESTAMPTZ
)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.ref_command, o.customer_name, o.customer_phone, o.order_status,
         o.payment_status, o.payment_method, o.subtotal, o.shipping_cost,
         o.total_amount, o.shipping_zone_name, o.items, o.created_at
    FROM public.orders o
   WHERE o.public_token = p_token;
$$;

-- Autorisée à tous : c'est elle-même qui constitue la preuve d'identité
-- (connaître le jeton), et elle ne renvoie qu'une commande.
GRANT EXECUTE ON FUNCTION public.get_order_by_token(UUID) TO anon, authenticated;


-- ══════════════════════════════════════════════════════ vue d'agrégation ════
-- `site_events` est volumineux. On expose une vue d'agrégation par jour au
-- public, pas la table : le détail ligne à ligne reste réservé à l'admin.
CREATE OR REPLACE VIEW public.public_daily_stats
WITH (security_invoker = true) AS
  SELECT day, event, count(*)::integer AS hits
    FROM public.site_events
   GROUP BY day, event;

COMMENT ON VIEW public.public_daily_stats IS
  'Agrégat public par jour et par type d''événement. Le détail reste privé.';


-- ═══════════════════════════════════════════════════════════ granted ═══════
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public
  TO authenticated;
GRANT SELECT, INSERT ON public.orders, public.leads, public.site_events TO anon;
GRANT SELECT ON public.public_daily_stats TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
-- =============================================================================

-- ██  VÉRIFICATION — doit renvoyer 0 ligne pour chacune de ces trois requêtes.
--
--   SELECT * FROM public.orders;          -- attendu : 0 ligne (le tableau
--   SELECT * FROM public.leads;           --   client est secret)
--   SELECT * FROM public.site_admins;     --   : 0 ligne (la liste des
--                                         --   comptes est secrète)
--
-- Et ceci doit RÉUSSIR :
--   SELECT slug, name, price FROM public.products WHERE is_active;
--   SELECT count(*) FROM public.categories;
--   SELECT * FROM public.site_settings;
-- =============================================================================