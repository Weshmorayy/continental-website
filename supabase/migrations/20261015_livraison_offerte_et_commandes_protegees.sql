-- ══════════════════════════════════════════════════════════════════════════
-- Livraison offerte (par produit + globale) et commandes protégées
-- ══════════════════════════════════════════════════════════════════════════
--
-- Trois chantiers, un seul fichier parce qu'ils se tiennent :
--
--   1. `products.free_delivery` — le vendeur coche « livraison offerte » sur
--      un produit ; dès qu'un article du panier en bénéficie, la livraison
--      saute pour toute la commande (même règle que mgperfume).
--
--   2. `site_settings.delivery.freeForAll` — un interrupteur global qui rend
--      la livraison gratuite partout, sans toucher aux zones ni aux prix.
--      `freeFrom` (seuil en FCFA) reste actif en parallèle.
--
--   3. La fonction `create_order` — le trou par lequel n'importe qui pouvait
--      fabriquer une commande.
--
-- ── Pourquoi la fonction ─────────────────────────────────────────────────
-- La politique `orders_public_insert` autorisait `anon` à insérer une ligne
-- dans `orders`, avec `with_check` limité à `order_status = 'new'` et
-- `payment_status = 'pending'`. Tout le reste — sous-total, frais de port,
-- total, prix unitaires — venait du navigateur. Un petit malin pouvait poster
-- un iPhone à 1 FCFA, ou 400 commandes en boucle.
--
-- Désormais le navigateur ne peut plus écrire dans `orders`. Il appelle
-- `create_order(...)` et le serveur :
--
--   • relit chaque produit en base (slug + identifiant de variante) et
--     recalcule le sous-total à partir des prix réels — le prix envoyé par
--     le client est ignoré ;
--   • refuse un produit masqué, en rupture, ou une variante inexistante ;
--   • recalcule les frais de port à partir de `shipping_zones` puis applique
--     les règles de gratuité (produit, seuil, gratuité globale) ;
--   • borne les quantités (1 à 20) et le nombre de lignes (20) ;
--   • valide le nom et le téléphone ;
--   • limite à 5 commandes par numéro sur 30 minutes ;
--   • renvoie la commande déjà passée si la même personne reposte exactement
--     le même panier dans les 3 minutes (double-clic, réseau qui rame) ;
--   • impose `order_status = 'new'` et `payment_status = 'pending'` ;
--   • engendre lui-même la référence et le jeton public.
--
-- Le client reçoit en retour le sous-total, les frais et le total calculés
-- par le serveur : c'est ce qu'il affiche et ce qu'il met dans le message
-- WhatsApp. Plus rien n'est figé en dur côté navigateur.
--
-- ── Ordre d'application ─────────────────────────────────────────────────
--   psql -f 20261015_livraison_offerte_et_commandes_protegees.sql
-- Le redéploiement du site doit suivre : l'ancien `placeOrder` insère
-- directement et se fera refuser une fois la politique retirée.
-- ══════════════════════════════════════════════════════════════════════════

-- ── 1. Livraison offerte par produit ──────────────────────────────────────
alter table public.products
  add column if not exists free_delivery boolean not null default false;

comment on column public.products.free_delivery is
  'Livraison offerte sur ce produit : dès qu''une ligne du panier en bénéficie, les frais de port tombent à zéro pour toute la commande.';

create index if not exists products_free_delivery_idx
  on public.products (free_delivery) where free_delivery;

-- ── 2. Interrupteur global « livraison offerte partout » ─────────────────
update public.site_settings
   set delivery = coalesce(delivery, '{}'::jsonb) || jsonb_build_object('freeForAll', false)
 where id = 1
   and not (coalesce(delivery, '{}'::jsonb) ? 'freeForAll');

-- ── 3. La fonction de commande ────────────────────────────────────────────
create or replace function public.create_order(
  p_items              jsonb,
  p_customer_name      text,
  p_customer_phone     text,
  p_customer_email     text default null,
  p_customer_address   text default null,
  p_shipping_zone_id   uuid default null,
  p_payment_method     text default 'whatsapp',
  p_notes              text default null,
  p_honeypot           text default null
)
returns table (
  ref_command    text,
  public_token   uuid,
  subtotal       numeric,
  shipping_cost  numeric,
  total_amount   numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name          text;
  v_phone         text;
  v_email         text;
  v_address       text;
  v_notes         text;
  v_payment       text;
  v_item          jsonb;
  v_slug          text;
  v_key           text;
  v_variant_id    text;
  v_qty           int;
  v_product       public.products%rowtype;
  v_price         numeric;
  v_label         text;
  v_price_from    numeric;
  v_line          jsonb;
  v_lines         jsonb := '[]'::jsonb;
  v_subtotal      numeric := 0;
  v_any_free      boolean := false;
  v_zone          public.shipping_zones%rowtype;
  v_has_zone      boolean := false;
  v_zone_name     text := null;
  v_shipping      numeric := 0;
  v_delivery      jsonb;
  v_free_all      boolean := false;
  v_free_from     numeric := 0;
  v_ref           text;
  v_token         uuid;
  v_new_id        uuid;
  v_recent        int;
  v_attempt       int;
begin
  -- ── Piège à robots ──────────────────────────────────────────────────────
  -- Champ caché du formulaire : un humain ne le remplit jamais. On refuse
  -- sans expliquer, pour ne pas apprendre au robot ce qui l'a trahi.
  if nullif(btrim(coalesce(p_honeypot, '')), '') is not null then
    raise exception 'COMMANDE_REFUSEE';
  end if;

  -- ── Coordonnées ─────────────────────────────────────────────────────────
  v_name := btrim(coalesce(p_customer_name, ''));
  if length(v_name) < 2 then
    raise exception 'NOM_REQUIS';
  end if;
  if length(v_name) > 80 then
    v_name := left(v_name, 80);
  end if;

  v_phone := regexp_replace(coalesce(p_customer_phone, ''), '[^0-9+]', '', 'g');
  if length(v_phone) < 9 or length(v_phone) > 16 then
    raise exception 'TELEPHONE_INVALIDE';
  end if;

  v_email := nullif(btrim(coalesce(p_customer_email, '')), '');
  if v_email is not null then
    if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
      raise exception 'EMAIL_INVALIDE';
    end if;
    v_email := left(v_email, 120);
  end if;

  v_address := nullif(left(btrim(coalesce(p_customer_address, '')), 300), '');
  v_notes   := nullif(left(btrim(coalesce(p_notes, '')), 500), '');

  -- Paiement à la livraison, Wave, Orange Money. Tout le reste retombe sur
  -- le paiement à la livraison : la carte est désactivée, on ne la prend pas.
  v_payment := case
    when p_payment_method in ('whatsapp', 'cash', 'wave', 'orange_money')
      then p_payment_method
    else 'whatsapp'
  end;

  -- ── Panier ──────────────────────────────────────────────────────────────
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'PANIER_VIDE';
  end if;
  if jsonb_array_length(p_items) > 20 then
    raise exception 'PANIER_TROP_GRAND';
  end if;

  -- ── Trop de commandes du même numéro ────────────────────────────────────
  select count(*) into v_recent
    from public.orders o
   where o.customer_phone = v_phone
     and o.created_at > now() - interval '30 minutes';
  if v_recent >= 5 then
    raise exception 'TROP_DE_COMMANDES';
  end if;

  -- ── Reprise d'une commande identique (double-clic, réseau lent) ─────────
  -- On compare le panier reçu à l'empreinte du panier enregistré — les lignes
  -- stockées portent les mêmes champs (`slug`, `key`, `quantity`), donc la
  -- comparaison tient même après le recalcul des prix. Même numéro, même
  -- panier, moins de 3 minutes : on renvoie la commande existante au lieu
  -- d'en fabriquer une deuxième.
  select o.ref_command, o.public_token, o.subtotal, o.shipping_cost
    into v_ref, v_token, v_subtotal, v_shipping
    from public.orders o
   where o.customer_phone = v_phone
     and o.created_at > now() - interval '3 minutes'
     and (select jsonb_agg(
                   jsonb_build_object(
                     's', x->>'slug',
                     'k', coalesce(nullif(x->>'key', ''), x->>'slug'),
                     'q', x->>'quantity'
                   )
                   order by x->>'slug', coalesce(nullif(x->>'key', ''), x->>'slug')
                 )
            from jsonb_array_elements(o.items) x)
         is not distinct from
         (select jsonb_agg(
                   jsonb_build_object(
                     's', coalesce(y->>'slug', y->>'productId'),
                     'k', coalesce(nullif(y->>'key', ''), coalesce(y->>'slug', y->>'productId')),
                     'q', y->>'quantity'
                   )
                   order by coalesce(y->>'slug', y->>'productId'),
                            coalesce(nullif(y->>'key', ''), coalesce(y->>'slug', y->>'productId'))
                 )
            from jsonb_array_elements(p_items) y)
   order by o.created_at desc
   limit 1;
  if found then
    return query select v_ref, v_token, v_subtotal, v_shipping, v_subtotal + v_shipping;
    return;
  end if;

  -- La reprise ci-dessus a échoué : `select ... into` a remis ses quatre cibles
  -- à NULL, y compris `v_shipping`, ce qui efface la valeur 0 posée en tête de
  -- fonction. Sans cette remise à zéro, un panier sans zone et sous le seuil de
  -- gratuité part à l'insertion avec `shipping_cost` NULL et la commande est
  -- perdue sur la contrainte NOT NULL.
  v_subtotal := 0;
  v_shipping := 0;

  for v_item in select value from jsonb_array_elements(p_items) loop
    if jsonb_typeof(v_item) <> 'object' then
      raise exception 'LIGNE_INVALIDE';
    end if;

    v_slug := nullif(btrim(coalesce(v_item->>'slug', v_item->>'productId', '')), '');
    if v_slug is null then
      raise exception 'LIGNE_SANS_PRODUIT';
    end if;

    -- Quantité : refus net si ce n'est pas un entier, sinon bornée à 1..20.
    if coalesce(v_item->>'quantity', '') !~ '^[0-9]{1,2}$' then
      raise exception 'QUANTITE_INVALIDE';
    end if;
    v_qty := greatest(1, least(20, (v_item->>'quantity')::int));

    -- Le prix vient de la base, jamais du navigateur.
    select * into v_product
      from public.products p
     where p.slug = v_slug
     limit 1;
    if not found then
      raise exception 'PRODUIT_INTROUVABLE';
    end if;
    if not coalesce(v_product.is_active, true) then
      raise exception 'PRODUIT_INDISPONIBLE';
    end if;
    if coalesce(v_product.in_stock, true) is not true then
      raise exception 'PRODUIT_INDISPONIBLE';
    end if;

    -- Variante : la cle du panier porte « slug::v-xxx ». On la retrouve dans
    -- la colonne `variants` par son `id` — pas par son libellé, qui peut
    -- changer.
    v_key := nullif(btrim(coalesce(v_item->>'key', '')), '');
    v_variant_id := null;
    if v_key is not null and position('::' in v_key) > 0 then
      v_variant_id := nullif(substr(v_key, position('::' in v_key) + 2), '');
    elsif v_key is not null and v_key <> v_slug then
      v_variant_id := v_key;
    end if;

    v_price := coalesce(v_product.price, 0);
    v_label := v_product.name;

    if v_variant_id is not null and jsonb_typeof(coalesce(v_product.variants, '[]'::jsonb)) = 'array' then
      -- L'élément est aliasé `elem` : un alias d'une lettre (`v`) entrerait en
      -- collision avec les variables `v_*` du bloc plpgsql.
      select
        coalesce((elem->>'price')::numeric, v_product.price, 0),
        nullif(btrim(coalesce(elem->>'label', '')), '')
        into v_price, v_label
        from jsonb_array_elements(v_product.variants) elem
       where elem->>'id' = v_variant_id
       limit 1;
      if not found then
        raise exception 'VARIANTE_INTROUVABLE';
      end if;
      if v_label is not null and v_label <> '' then
        v_label := v_product.name || ' — ' || v_label;
      else
        v_label := v_product.name;
      end if;
    end if;

    if coalesce(v_product.free_delivery, false) then
      v_any_free := true;
    end if;

    v_subtotal := v_subtotal + (v_price * v_qty);

    -- On réécrit la ligne avec les données du serveur : nom, référence, prix
    -- et image ne peuvent plus être falsifiés, et la commande reste lisible
    -- même si le produit change ensuite.
    v_line := jsonb_build_object(
      'productId', v_product.slug,
      'slug',      v_product.slug,
      'key',       coalesce(v_key, v_product.slug),
      'name',      v_label,
      'ref',       v_product.ref_,
      'price',     v_price,
      'quantity',  v_qty,
      'image',     v_product.image
    );
    if v_variant_id is not null then
      v_line := v_line || jsonb_build_object('variantId', v_variant_id);
    end if;

    v_lines := v_lines || jsonb_build_array(v_line);
  end loop;

  -- ── Livraison ───────────────────────────────────────────────────────────
  if p_shipping_zone_id is not null then
    select * into v_zone from public.shipping_zones z where z.id = p_shipping_zone_id;
    if not found then
      raise exception 'ZONE_INTROUVABLE';
    end if;
    v_has_zone  := true;
    v_zone_name := v_zone.name;
    v_shipping  := coalesce(v_zone.price, 0);
  end if;

  select coalesce(delivery, '{}'::jsonb) into v_delivery
    from public.site_settings where id = 1;

  -- Lectures tolérantes : une valeur mal saisie dans les réglages ne doit
  -- jamais faire échouer une prise de commande.
  v_free_all  := coalesce(v_delivery->>'freeForAll', 'false') in ('true', 't', '1', 'yes');
  v_free_from := case
    when coalesce(v_delivery->>'freeFrom', '') ~ '^[0-9]+(\.[0-9]+)?$'
      then (v_delivery->>'freeFrom')::numeric
    else 0
  end;

  if v_free_all or v_any_free then
    v_shipping := 0;
  elsif v_free_from > 0 and v_subtotal >= v_free_from then
    v_shipping := 0;
  end if;

  -- ── Écriture ────────────────────────────────────────────────────────────
  -- La référence est unique en base ; on retente plutôt que d'échouer sur
  -- une collision improbable.
  for v_attempt in 1..5 loop
    v_ref := 'CNT-' || to_char(now(), 'YYYY') || '-' ||
             upper(substr(md5(random()::text || clock_timestamp()::text), 1, 5));
    begin
      insert into public.orders (
        ref_command, customer_name, customer_phone, customer_email,
        customer_address, shipping_zone_id, shipping_zone_name,
        shipping_cost, subtotal, total_amount, items,
        payment_method, payment_status, order_status, notes
      ) values (
        v_ref, v_name, v_phone, v_email,
        v_address, p_shipping_zone_id, v_zone_name,
        v_shipping, v_subtotal, v_subtotal + v_shipping, v_lines,
        v_payment, 'pending', 'new', v_notes
      )
      returning id into v_new_id;
      exit;
    exception when unique_violation then
      v_new_id := null;
    end;
  end loop;

  if v_new_id is null then
    raise exception 'COMMANDE_NON_ENREGISTREE';
  end if;

  select o.public_token into v_token from public.orders o where o.id = v_new_id;

  return query select v_ref, v_token, v_subtotal, v_shipping, v_subtotal + v_shipping;
end;
$$;

comment on function public.create_order is
  'Crée une commande en recalculant prix, sous-total et frais de port côté serveur. Seul point d''écriture public sur `orders` : l''insertion directe par anon est révoquée.';

-- ── 4. Fermer l'écriture directe ─────────────────────────────────────────
-- On retire la politique qui laissait `anon` insérer, puis on révoque ses
-- droits d'écriture. `anon` n'a plus aucune raison d'écrire dans `orders`.
drop policy if exists orders_public_insert on public.orders;

revoke insert, update, delete on public.orders from anon;

-- `authenticated` (l'admin) garde ses droits : il doit pouvoir changer le
-- statut d'une commande depuis le back-office. On ne touche pas à ses grants.

revoke all on function public.create_order(jsonb, text, text, text, text, uuid, text, text, text) from public;
grant execute on function public.create_order(jsonb, text, text, text, text, uuid, text, text, text) to anon, authenticated;
