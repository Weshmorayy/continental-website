-- =============================================================================
-- CONTINENTAL® — Schéma Supabase (projet tbaizfoircknsznmpcvb)
-- 001_schema.sql — Tables, index, triggers. À exécuter EN PREMIER.
-- =============================================================================
-- Contrainte d'exécution : ce fichier doit tourner avec le rôle `postgres`
-- (le propriétaire). L'application ne l'utilisera jamais : elle se connecte
-- avec `anon` ou `authenticated`, qui ne possèdent rien.
--
-- Idempotent : `IF NOT EXISTS` partout. Rejouer le fichier ne casse rien.
-- =============================================================================

-- ─────────────────────────────────────────────────────────── types énumérés ──
DO $$ BEGIN
  CREATE TYPE product_kind AS ENUM ('physical', 'service');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM
    ('new', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM ('new', 'in_progress', 'done', 'spam');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE lead_kind AS ENUM
    ('contact', 'devis', 'newsletter', 'whatsapp_order');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ───────────────────────────────────────────────────────────────── admins ──
-- Qui a le droit d'administrer le site. Clé = email du compte Supabase Auth.
--
-- On ne se fie PAS au rôleclaim du JWT : une liste explicite en base est la
-- seule autorité. Si quelqu'un se désabonne d'un compte, la ligne ici décide.
CREATE TABLE IF NOT EXISTS public.site_admins (
  email     TEXT PRIMARY KEY,
  full_name TEXT,
  -- 'admin' : tout. 'editor' : pas de gestion des administrateurs.
  role      TEXT NOT NULL DEFAULT 'editor'
            CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ────────────────────────────────────────────────────────────── catégories ──
CREATE TABLE IF NOT EXISTS public.categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       TEXT NOT NULL,
  label      TEXT NOT NULL,
  kind       product_kind NOT NULL DEFAULT 'physical',
  -- Rang d'affichage. L'ordre alphabétique n'est jamais un ordre volontaire.
  position   INTEGER NOT NULL DEFAULT 0,
  image      TEXT,
  intro      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT categories_slug_key UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS categories_position_idx ON public.categories (position);


-- ──────────────────────────────────────────────────────────────── produits ──
CREATE TABLE IF NOT EXISTS public.products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL,
  name        TEXT NOT NULL,
  -- Référence fabricant. `ref` est un mot réservé en SQL, d'où ref_.
  ref_        TEXT,
  sku         TEXT,

  category_id UUID REFERENCES public.categories (id) ON DELETE SET NULL,

  price       NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  compare_at  NUMERIC(12, 2) CHECK (compare_at IS NULL OR compare_at >= 0),

  image       TEXT,
  image_alt   TEXT,
  -- Galerie : tableau d'URL de stockage.
  images      TEXT[] NOT NULL DEFAULT '{}',

  short_desc  TEXT,
  description TEXT,

  -- Listes de caractéristiques, éditables ligne à ligne dans l'admin.
  features    TEXT[] NOT NULL DEFAULT '{}',
  -- Tableau technique clé/valeur : {"Puissance":"65W","Débit":"60 m³/h"}
  specs       JSONB NOT NULL DEFAULT '{}'::jsonb,

  badge       TEXT,
  in_stock    BOOLEAN NOT NULL DEFAULT true,
  -- `is_active` = visible publiquement. Séparé de `in_stock` : un produit peut
  -- être visible mais en rupture, et l'inverse (présent mais masqué) arrive.
  is_active   BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,

  position    INTEGER NOT NULL DEFAULT 0,
  views       INTEGER NOT NULL DEFAULT 0,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT products_slug_key UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS products_category_idx  ON public.products (category_id);
CREATE INDEX IF NOT EXISTS products_active_idx   ON public.products (is_active, position);
CREATE INDEX IF NOT EXISTS products_featured_idx ON public.products (is_featured) WHERE is_featured;
CREATE INDEX IF NOT EXISTS products_price_idx    ON public.products (price);


-- ──────────────────────────────────────────────────────────────── bannières ──
CREATE TABLE IF NOT EXISTS public.banners (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Emplacement logique : 'home-hero', 'home-strip', 'catalogue-top'…
  slot       TEXT NOT NULL DEFAULT 'home-hero',
  tag        TEXT,
  title      TEXT NOT NULL,
  subtitle   TEXT,
  image      TEXT,
  image_alt  TEXT,
  cta_label  TEXT,
  cta_href   TEXT,
  -- Recadrage : 'center', 'center top', 'left bottom'…
  object_position TEXT NOT NULL DEFAULT 'center',
  active     BOOLEAN NOT NULL DEFAULT true,
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS banners_slot_idx ON public.banners (slot, active, position);


-- ─────────────────────────────────────────────────────────────── livraison ──
CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       TEXT NOT NULL,
  name       TEXT NOT NULL,
  price      NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  delay      TEXT NOT NULL DEFAULT '',
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT shipping_zones_slug_key UNIQUE (slug)
);


-- ──────────────────────────────────────────────────────────────── questions ──
CREATE TABLE IF NOT EXISTS public.faqs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  category   TEXT,
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS faqs_position_idx ON public.faqs (position);


-- ───────────────────────────────────────────────────────────────── commandes ──
CREATE TABLE IF NOT EXISTS public.orders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_command  TEXT NOT NULL,
  customer_name  TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_address TEXT,

  shipping_zone_id   UUID REFERENCES public.shipping_zones (id) ON DELETE SET NULL,
  shipping_zone_name TEXT,
  shipping_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  subtotal     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,

  -- [{productId, name, ref, price, quantity, image}]
  items        JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- 'whatsapp' | 'wave' | 'orange_money' | 'free_money' | 'cash'
  payment_method TEXT NOT NULL DEFAULT 'whatsapp',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  order_status   order_status NOT NULL DEFAULT 'new',

  notes       TEXT,

  -- Jeton public : c'est par là que le client consulte SA commande.
  -- Sans lui, il ne pourrait pas prouver qu'une commande lui appartient, et
  -- ouvrir la lecture à tous reviendrait à publier le carnet d'adresses.
  public_token UUID NOT NULL DEFAULT gen_random_uuid(),

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT orders_ref_key UNIQUE (ref_command)
);

CREATE INDEX IF NOT EXISTS orders_status_idx  ON public.orders (order_status);
CREATE INDEX IF NOT EXISTS orders_created_idx ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_token_idx   ON public.orders (public_token);
CREATE INDEX IF NOT EXISTS orders_phone_idx   ON public.orders (customer_phone);


-- ────────────────────────────────────────────────────────── demandes / leads ──
CREATE TABLE IF NOT EXISTS public.leads (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 'contact' | 'devis' | 'newsletter' | 'whatsapp_order'
  kind       lead_kind NOT NULL DEFAULT 'contact',
  name       TEXT,
  phone      TEXT,
  email      TEXT,
  city       TEXT,
  message    TEXT,
  -- Produit qui a déclenché la demande (demande de devis d'un clim, etc.)
  product_id UUID REFERENCES public.products (id) ON DELETE SET NULL,
  payload    JSONB NOT NULL DEFAULT '{}'::jsonb,
  status     lead_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Un formulaire public ne doit pas pouvoir se marquer « traité » ni
  -- s'attribuer une date arbitraire : seules ces deux colonnes sont libres.
  CONSTRAINT leads_public_columns
    CHECK (created_at >= now() - INTERVAL '1 minute')
);

CREATE INDEX IF NOT EXISTS leads_status_idx  ON public.leads (status, created_at DESC);
CREATE INDEX IF NOT EXISTS leads_kind_idx    ON public.leads (kind, created_at DESC);


-- ─────────────────────────────────────────────────────────── réglages site ──
-- Une seule ligne. `singleton` vaut toujours 1 et porte une contrainte
-- d'unicité : impossible d accidentellement en créer une deuxième.
CREATE TABLE IF NOT EXISTS public.site_settings (
  id        INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  contact   JSONB NOT NULL DEFAULT '{}'::jsonb,
  social    JSONB NOT NULL DEFAULT '{}'::jsonb,
  hours     JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo       JSONB NOT NULL DEFAULT '{}'::jsonb,
  payments  JSONB NOT NULL DEFAULT '{}'::jsonb,
  delivery  JSONB NOT NULL DEFAULT '{}'::jsonb,
  legal     JSONB NOT NULL DEFAULT '{}'::jsonb,
  homepage  JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────── médias ──
CREATE TABLE IF NOT EXISTS public.media (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path       TEXT NOT NULL,           -- clé dans le bucket Supabase Storage
  url        TEXT NOT NULL,
  mime       TEXT NOT NULL DEFAULT 'image/jpeg',
  size       INTEGER NOT NULL DEFAULT 0,
  width      INTEGER,
  height     INTEGER,
  folder     TEXT NOT NULL DEFAULT 'racine',
  alt        TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT media_path_key UNIQUE (path)
);

CREATE INDEX IF NOT EXISTS media_folder_idx ON public.media (folder, created_at DESC);


-- ──────────────────────────────────────────── instantanés de configuration ──
CREATE TABLE IF NOT EXISTS public.site_backups (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_name  TEXT NOT NULL DEFAULT 'Configuration globale',
  products_data   JSONB NOT NULL DEFAULT '[]'::jsonb,
  banners_data    JSONB NOT NULL DEFAULT '[]'::jsonb,
  shipping_data   JSONB NOT NULL DEFAULT '[]'::jsonb,
  faqs_data       JSONB NOT NULL DEFAULT '[]'::jsonb,
  contact_data    JSONB NOT NULL DEFAULT '{}'::jsonb,
  social_data     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ─────────────────────────────────────────────────────────── pages éditorial ──
CREATE TABLE IF NOT EXISTS public.pages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       TEXT NOT NULL,
  title      TEXT NOT NULL,
  excerpt    TEXT,
  body       TEXT NOT NULL DEFAULT '',
  image      TEXT,
  seo        JSONB NOT NULL DEFAULT '{}'::jsonb,
  published  BOOLEAN NOT NULL DEFAULT true,
  position   INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pages_slug_key UNIQUE (slug)
);


-- ──────────────────────────────────────────── événements de statistiques ──
CREATE TABLE IF NOT EXISTS public.site_events (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event      TEXT NOT NULL,
  path       TEXT,
  meta       JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Jour UTC : agréger une année ne demande alors qu'un scan d'index.
  day        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS site_events_day_idx   ON public.site_events (day);
CREATE INDEX IF NOT EXISTS site_events_type_idx  ON public.site_events (event, day);


-- ──────────────────────────────────────────────── déclencheur updated_at ────
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'products', 'categories', 'banners', 'faqs', 'orders',
    'site_settings', 'pages'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS touch_%1$s ON public.%1$I', t);
    EXECUTE format(
      'CREATE TRIGGER touch_%1$s BEFORE UPDATE ON public.%1$I
       FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()', t);
  END LOOP;
END $$;

-- Le compteur de vues doit pouvoir être incrémenté par la page produit sans
-- que le visiteur ait les droits d'écriture sur la ligne entière.
CREATE OR REPLACE FUNCTION public.bump_product_views(p_slug TEXT)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.products SET views = views + 1
   WHERE slug = p_slug AND is_active = true;
$$;
REVOKE ALL ON FUNCTION public.bump_product_views(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bump_product_views(TEXT) TO anon, authenticated;
-- =============================================================================