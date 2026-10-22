-- ============================================================================
--  Continental — garde-fou : interdire la suppression d'une VRAIE commande
--  Base : tbaizfoircknsznmpcvb (projet CT)
--  Écrit le 2026-10-17. À exécuter dans Supabase → SQL Editor (DDL uniquement).
--
--  PROBLÈME VISÉ
--  Le portail d'administration permet de supprimer une commande. Rien, en base,
--  n'empêche l'effacement définitif d'une commande client réelle (une erreur de
--  clic = perte de commande, sans corbeille ni journal).
--
--  RÈGLE APPLIQUÉE
--  Une ligne de public.orders ne peut être supprimée que si elle ressemble à une
--  commande de TEST : le mot « test » apparaît comme mot entier (insensible à la
--  casse et aux accents) dans customer_name, ref_command ou notes.
--  Tout le reste est refusé par la base elle-même, quel que soit le client
--  (portail admin, appel direct PostgREST, script).
--  Exception : le rôle service_role garde le droit de supprimer — c'est le rôle
--  des scripts serveur de confiance (nettoyage RGPD, maintenance).
--
--  L'IDEMPOTENCE EST ASSURÉE : le script peut être rejoué sans erreur.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1) Fonction de contrôle
-- ---------------------------------------------------------------------------
create or replace function public.orders_delete_guard()
returns trigger
language plpgsql
-- PAS de SECURITY DEFINER : on veut que current_user reflète le rôle réellement
-- actif de l'appel (service_role, authenticated, anon…). Avec SECURITY DEFINER,
-- current_user deviendrait le propriétaire de la fonction et le contournement
-- service_role ne fonctionnerait plus.
security invoker
set search_path = public, pg_temp
as $$
declare
  haystack text;
  is_test  boolean;
begin
  -- Les rôles de confiance gardent la main (scripts serveur, maintenance).
  if current_user in ('service_role', 'postgres', 'supabase_admin') then
    return old;
  end if;

  -- On rassemble les champs qui peuvent légitimement porter le mot « test »,
  -- on replie les accents, on minuscule, et on encadre le tout d'espaces pour
  -- que « test » soit détecté comme MOT ENTIER (et non à l'intérieur de
  -- « contestation » ou « attestation »).
  haystack := ' ' ||
    translate(
      lower(
        coalesce(old.customer_name, '') || ' ' ||
        coalesce(old.ref_command,   '') || ' ' ||
        coalesce(old.notes,         '')
      ),
      'áàâäãåéèêëíìîïóòôöõúùûüçñ',
      'aaaaaaeeeeiiiiooooouuuucn'
    ) || ' ';

  is_test := haystack like '% test %'
          or haystack like '% test-%'
          or haystack like '%-test %'
          or haystack like '%-test-%'
          or haystack like '%"test"%';

  if is_test then
    return old;
  end if;

  -- Refus explicite : le message est destiné à être lu tel quel dans l'interface.
  raise exception
    'Suppression refusée : la commande % n''est pas marquée « test ». Une commande client réelle ne peut pas être supprimée depuis l''application. Annulez-la (order_status) ou passez par le support pour un effacement RGPD.',
    coalesce(nullif(old.ref_command, ''), old.id::text)
    using errcode = '42501';  -- insufficient_privilege
end;
$$;

comment on function public.orders_delete_guard() is
  'Interdit la suppression d''une commande non marquée « test » (sauf service_role).';


-- ---------------------------------------------------------------------------
-- 2) Déclencheur BEFORE DELETE
-- ---------------------------------------------------------------------------
drop trigger if exists orders_delete_guard on public.orders;

create trigger orders_delete_guard
  before delete on public.orders
  for each row
  execute function public.orders_delete_guard();


-- ---------------------------------------------------------------------------
-- 3) Vérifications à lancer APRÈS exécution (à copier une par une)
-- ---------------------------------------------------------------------------

-- 3a) Le déclencheur est bien là, en BEFORE DELETE, actif :
-- select tgname, tgtype, tgenabled
--   from pg_trigger
--  where tgrelid = 'public.orders'::regclass and not tgisinternal;

-- 3b) Refus attendu (lever l'erreur 42501) — remplacez l'uuid par une vraie
--     commande NON marquée test :
-- begin;
--   delete from public.orders where id = '00000000-0000-0000-0000-000000000000';
-- rollback;

-- 3c) Autorisation attendue — une commande marquée test :
-- begin;
--   delete from public.orders where id = '<uuid-d-une-commande-de-test>';
-- rollback;

-- 3d) Contrôle de la logique de détection sans rien supprimer :
-- select
--   x as cas,
--   (' ' || translate(lower(x), 'áàâäãåéèêëíìîïóòôöõúùûüçñ',
--                                'aaaaaaeeeeiiiiooooouuuucn') || ' ') like '% test %'
--   as detecte_comme_test
-- from (values
--   ('Commande test'), ('TEST-001'), ('Attestation de paiement'),
--   ('Contestation client'), ('Aïssatou Test Diallo'), ('Awa Ndiaye')
-- ) as t(x);


-- ---------------------------------------------------------------------------
-- 4) Retour arrière (si la règle doit être retirée un jour)
-- ---------------------------------------------------------------------------
-- drop trigger if exists orders_delete_guard on public.orders;
-- drop function if exists public.orders_delete_guard();
