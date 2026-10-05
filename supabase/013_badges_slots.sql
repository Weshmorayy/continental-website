-- =============================================================================
-- 013_badges_slots.sql — Promotions & badges, avec un nombre de places limité
-- =============================================================================
-- Le problème que ce fichier règle
-- -------------------------------
-- Les blocs « héros » et « Notre plus vendu » de la page d'accueil ne
-- désignaient aucun produit réel : ils pointaient sur `data.product_slug` avec
-- des visuels de maquette présents dans `public/products/` et des arguments
-- commercial inventés (« 12000 BTU », « 21 dB », « Revêtement Gold Fin »).
-- La base ne contient pourtant aucun produit de ce slug. Le composant retombait
-- donc sur une fiche factice et affichait 195 000 FCFA — un prix qui n'existe
-- nulle part — pendant que le climatiseur réellement en base est à 30 000.
--
-- Choisir une mise en avant en éditant du JSON de bloc ne tient pas : rien
-- n'empêche de viser un produit supprimé, et personne ne sait d'un coup d'œil
-- combien de produits portent la pastille « Best-seller ». La pastille est donc
-- portée par le produit lui-même, dans une table à places limitées.
--
-- Le principe des « limited slots »
-- --------------------------------
-- Une place = un emplacement unique sur le site, occupé par UN seul produit.
--   • UNE place  : `hero` (produit du héros d'accueil), `bestseller`.
--   • PLUSIEURES : `promo`, `nouveau`, `stock_limite` — rubriques à plusieurs
--                  entrées, mais chaque produit n'y occupe qu'une seule place.
--
-- La limite est appliquée PAR LA BASE, pas par l'interface : un index unique
-- partiel refuse une deuxième ligne active sur `hero` ou `bestseller`. Aucun
-- écran d'administration, aussi-soigné soit-il, ne peut produire deux
-- « Best-seller » simultanés — l'erreur devient impossible au lieu d'être
-- improbable.
--
-- Une promotion peut être programmée : `starts_at` et `ends_at` la font
-- apparaître et disparaître toute seule, sans intervention. Le filtrage est
-- fait dans la vue, pas dans le composant, pour que toutes les pages voient la
-- même chose.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.product_badges (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  slot       text NOT NULL,
  label      text NOT NULL,
  starts_at  timestamptz,
  ends_at    timestamptz,
  position   integer NOT NULL DEFAULT 0,
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT product_badges_slot_check CHECK (
    slot IN ('hero', 'bestseller', 'promo', 'nouveau', 'stock_limite')
  ),

  -- Une étiquette est un texte court affiché sur une pastille : au-delà de 24
  -- caractères elle déborde de la tuile sur mobile.
  CONSTRAINT product_badges_label_check CHECK (char_length(label) BETWEEN 1 AND 24),

  -- Une promotion ne peut pas se terminer avant de commencer.
  CONSTRAINT product_badges_window_check CHECK (
    ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at
  )
);

COMMENT ON TABLE public.product_badges IS
  'Promotions et badges produits, répartis sur des places à occupation unique.';

CREATE UNIQUE INDEX IF NOT EXISTS product_badges_one_per_slot
  ON public.product_badges (slot, product_id)
  WHERE active;

-- La limite à une place. `WHERE active AND slot IN (...)` rend l'index
-- partiel : seules les places uniques entrent dans la contrainte, et une ligne
-- désactivée (ou expirée puis archivée) libère sa place sans être supprimée.
CREATE UNIQUE INDEX IF NOT EXISTS product_badges_singleton_slots
  ON public.product_badges (slot)
  WHERE active AND slot IN ('hero', 'bestseller');

CREATE INDEX IF NOT EXISTS product_badges_active_idx
  ON public.product_badges (slot, position)
  WHERE active;

-- -----------------------------------------------------------------------------
-- Vue publique : ce que le site a le droit de savoir
-- -----------------------------------------------------------------------------
-- Elle ne joint que ce que la vitrine affiche déjà ailleurs : nom, image, prix,
-- slug. Aucun stock, aucun coût, aucune référence interne de commande. Le
-- filtrage des dates est ici, et non dans le code : une page web et le tableau
-- de bord ne peuvent pas diverger sur ce qui est en promotion aujourd'hui.

CREATE OR REPLACE VIEW public.public_product_badges AS
SELECT
  b.slot,
  b.label,
  b.position,
  p.slug,
  p.name,
  p.ref_            AS ref,
  p.image,
  p.price,
  p.compare_at
FROM public.product_badges b
JOIN public.products p ON p.id = b.product_id
WHERE b.active
  AND p.is_active
  AND (b.starts_at IS NULL OR b.starts_at <= now())
  AND (b.ends_at   IS NULL OR b.ends_at   >  now());

COMMENT ON VIEW public.public_product_badges IS
  'Badges et promotions en cours, prêts à afficher sur la vitrine.';

GRANT SELECT ON public.public_product_badges TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- Places uniques : une fonction, un produit
-- -----------------------------------------------------------------------------
-- `set_slot(p_slug, p_slot, p_label)` attribue une place et libère
-- automatiquement celle qu'elle occupait : poser « Best-seller » sur le
-- ventilateur le retire du climatiseur. C'est ce qui rend la place unique
-- gérable au quotidien, sans aller nettoyer une ligne à la main.
--
-- La fonction est en SECURITY DEFINER parce qu'elle doit écrire dans une table
-- que le rôle du visiteur n'a pas le droit de toucher. Seuls `postgres` et
-- `service_role` peuvent l'appeler ; les nominations de badges passeront par
-- l'administration authentifiée, jamais depuis la vitrine.

-- La fonction est en SECURITY DEFINER parce qu'elle doit écrire dans une
-- table que le rôle du visiteur n'a pas le droit de toucher. Elle n'est
-- cependant pas réservée à `postgres` : ce sont les ADMINISTRATEURS qui pose
-- les badges, depuis le navigateur, avec leur propre compte connecté. La
-- fonction vérifie donc elle-même les droits de l'appelant avant d'écrire.
--
-- Deux niveaux de refus :
--   1. `anon` n'a pas EXECUTE du tout → un visiteur ne peut rien appeler ;
--   2. un compte authentifié SANS droit d'écriture sur les produits reçoit une
--      erreur 42501 — et ce contrôle a lieu AVANT toute écriture, jamais après.
--
-- Si ce contrôle était fait uniquement par une politique RLS, il s'appliquerait
-- au rôle du visiteur, c'est-à-dire à PERSONNE : c'est précisément pour cela
-- que la fonction est en SECURITY DEFINER, et c'est pourquoi elle doit
-- reconstituer elle-même le rôle de l'appelant avec `can_module()`.

CREATE OR REPLACE FUNCTION public.set_slot(p_slug text, p_slot text, p_label text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  target  uuid;
  new_row uuid;
BEGIN
  IF NOT public.can_module('products', 'write') THEN
    RAISE EXCEPTION 'Droits insuffisants : écriture sur les produits requise.'
      USING ERRCODE = '42501';
  END IF;

  SELECT id INTO target FROM public.products WHERE slug = p_slug AND is_active;
  IF target IS NULL THEN
    RAISE EXCEPTION 'Produit introuvable ou inactif : %', p_slug;
  END IF;

  IF p_slot NOT IN ('hero', 'bestseller', 'promo', 'nouveau', 'stock_limite') THEN
    RAISE EXCEPTION 'Place inconnue : %', p_slot;
  END IF;

  -- Libère la place occupée par ce produit sur CETTE place.
  UPDATE public.product_badges
     SET active = false
   WHERE product_id = target AND slot = p_slot AND active;

  -- Et libère la place si un autre produit la tenait déjà : c'est ce second
  -- UPDATE qui rend « une seule place » vrai, même en cas de double décision.
  UPDATE public.product_badges
     SET active = false
   WHERE slot = p_slot AND active
     AND p_slot IN ('hero', 'bestseller')
     AND product_id <> target;

  INSERT INTO public.product_badges (product_id, slot, label)
  VALUES (
    target,
    p_slot,
    coalesce(p_label, CASE p_slot
      WHEN 'hero'        THEN 'À la une'
      WHEN 'bestseller'  THEN 'Best-seller'
      WHEN 'promo'       THEN 'Promotion'
      WHEN 'nouveau'     THEN 'Nouveau'
      ELSE 'Stock limité'
    END)
  )
  RETURNING id INTO new_row;

  RETURN new_row;
END;
$function$;

-- Rappel : sur Supabase, EXECUTE est accordé d'office à anon et authenticated
-- par pg_default_acl. Sans REVOKE explicite, n'importe quel visiteur du site
-- pourrait s'attribuer la place « héros » — c'est-à-dire afficher son produit
-- en tête de la page d'accueil.
REVOKE EXECUTE ON FUNCTION public.set_slot(text, text, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.set_slot(text, text, text) TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Vue « licence » du tableau de bord
-- -----------------------------------------------------------------------------
-- Le portail affiche le nombre de places restantes par rubrique. C'est ce
-- compteur qui répond à « combien de produits peuvent porter un badge ? » sans
-- qu'il faille compter les lignes à la main.

CREATE OR REPLACE VIEW public.public_badge_capacity AS
SELECT
  slot,
  max_rows,
  used,
  max_rows - used AS remaining
FROM (
  SELECT
    slot,
    CASE slot WHEN 'hero' THEN 1 WHEN 'bestseller' THEN 1 ELSE 6 END AS max_rows,
    count(*)::int AS used
  FROM public.product_badges b
  JOIN public.products p ON p.id = b.product_id
  WHERE b.active
    AND p.is_active
    AND (b.starts_at IS NULL OR b.starts_at <= now())
    AND (b.ends_at   IS NULL OR b.ends_at   >  now())
  GROUP BY slot
) t
UNION ALL
SELECT slot, cap, 0, cap
FROM (VALUES ('hero', 1), ('bestseller', 1), ('promo', 6), ('nouveau', 6), ('stock_limite', 6))
     AS caps(slot, cap)
WHERE slot NOT IN (SELECT slot FROM public.public_product_badges);

COMMENT ON VIEW public.public_badge_capacity IS
  'Places totales, occupées et restantes, par rubrique de badge.';

GRANT SELECT ON public.public_badge_capacity TO anon, authenticated;