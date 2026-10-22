-- =============================================================================
-- 20261017 — Unification des états de commande (référentiel MG Perfume)
-- =============================================================================
--
-- But : les deux boutiques du système (Continental, MG Perfume) doivent offrir
-- EXACTEMENT les mêmes états au vendeur. Le référentiel retenu est celui du
-- portail MG Perfume :
--
--     new · processing · shipped · delivered · cancelled
--
-- Continental en comptait six : « confirmed » (Confirmée) et « preparing »
-- (En préparation) n'existaient que chez lui. Les deux fusionnent dans
-- « processing » — confirmer une commande et la mettre en préparation est le
-- même geste pour un vendeur qui prépare des colis seul.
--
-- ── Pourquoi on AJOUTE une valeur au lieu de reconstruire le type ───────────
-- Reconstruire l'énumération (renommer, recréer, puis convertir la colonne)
-- échoue dès qu'un objet dépend de la colonne — et il y en a (vue publique
-- `get_order_by_token`, politiques RLS, index `orders_status_idx`). Il
-- faudrait les recréer tous, dans le bon ordre, pour un gain nul.
-- `ALTER TYPE ... ADD VALUE` est purement additif : aucun objet existant ne
-- bouge, et la migration ne peut pas casser le site en production.
--
-- Conséquence assumée : « confirmed » et « preparing » restent déclarés dans le
-- type. PostgreSQL ne sait pas retirer une valeur d'énumération. Ils ne sont
-- plus ni produits ni lus par l'application (voir src/lib/admin-types.ts), donc
-- invisibles côté vendeur.
--
-- ── ⚠ À LIRE AVANT D'EXÉCUTER ───────────────────────────────────────────────
-- PostgreSQL interdit d'UTILISER une valeur d'énumération ajoutée dans la même
-- transaction (erreur 55P04 « unsafe use of new value »). Le SQL Editor de
-- Supabase envoie le script entier en une seule transaction : exécuter donc
-- les DEUX BLOCS ci-dessous L'UN APRÈS L'AUTRE, pas d'un seul coup.
--
-- Le bloc 1 est idempotent, le bloc 2 aussi (il ne touche plus rien une fois
-- les lignes converties).
-- =============================================================================


-- ───────────────────────────────────────────────────────── bloc 1 : le type ──

do $$
begin
  if not exists (
    select 1
      from pg_enum e
      join pg_type t on t.oid = e.enumtypid
     where t.typname = 'order_status'
       and e.enumlabel = 'processing'
  ) then
    -- `after 'new'` garde l'ordre du parcours réel : une commande reçue passe
    -- en préparation, puis part. L'ordre compte pour tout tri sur la colonne.
    alter type public.order_status add value 'processing' after 'new';
  end if;
end
$$;


-- ─────────────────────────────────────────── bloc 2 : les lignes existantes ──
-- Exécuter APRÈS le bloc 1, dans une requête séparée (voir l'avertissement).

update public.orders
   set order_status = 'processing'
 where order_status::text in ('confirmed', 'preparing');


-- ───────────────────────────────────────────────────────────── vérification ──
--   1. Le type contient bien la nouvelle valeur :
--        select enum_range(null::public.order_status);
--      attendu : {new,processing,confirmed,preparing,shipped,delivered,cancelled}
--      (l'ordre des anciennes valeurs n'a pas d'importance, elles sont mortes)
--
--   2. Plus aucune ligne dans un état hérité :
--        select order_status, count(*) from public.orders group by 1 order by 1;
--
--   3. Le déclencheur de suppression protégée répond toujours :
--        select tgname, tgenabled from pg_trigger
--         where tgrelid = 'public.orders'::regclass and not tgisinternal;


-- ──────────────────────────────────────────────────────────── retour arrière ─
-- Il n'y a rien à défaire : les valeurs ajoutées sont inutilisées. Pour revenir
-- en arrière, il suffit de remettre le code d'avant (états `confirmed` et
-- `preparing` de nouveau lus) et de reconvertir les lignes :
--
--   update public.orders set order_status = 'confirmed'
--    where order_status = 'processing';
--
-- La valeur 'processing' resterait déclarée dans le type, sans effet.
