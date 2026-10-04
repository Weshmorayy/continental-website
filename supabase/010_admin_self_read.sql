-- 010 — Un collaborateur doit pouvoir lire sa propre ligne d'administration
--
-- Symptôme : un compte « editor » s'authentifie correctement puis l'écran
-- affiche « Compte authentifié, mais absent de la liste des administrateurs ».
--
-- Cause : la policy admins_read exigeait is_site_owner(), c'est-à-dire
-- role = 'admin'. Un collaborator n'était donc jamais autorisé à lire la
-- table site_admins. Or c'est justement cette lecture que fait le portail
-- pour savoir si l'utilisateur est autorisé (src/context/StoreContext.tsx,
-- checkAdmin). Boucle : l'éditeur ne peut pas prouver qu'il est éditeur.
--
-- Correctif : chacun peut lire SA PROPRE ligne, et uniquement la sienne.
-- Un administrateur garde la visibilité complète via is_site_owner().
-- Aucune écriture n'est ouverte : insert/update/delete restent réservés au
-- propriétaire du site.

DROP POLICY IF EXISTS "admins_read" ON public.site_admins;

CREATE POLICY "admins_read" ON public.site_admins
  FOR SELECT
  TO authenticated
  USING (
    is_site_owner()
    OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- Filet de sécurité : la policy doit rester une lecture de son propre compte,
-- jamais du contenu du site. Un utilisateur authentifié ne doit voir que les
-- lignes dont il est lui-même l'e-mail.
DO $$
DECLARE
  v_vusantes integer;
  v_total   integer;
BEGIN
  SELECT count(*) INTO v_total FROM public.site_admins;
  SELECT count(*) INTO v_vusantes
    FROM public.site_admins a
   WHERE lower(a.email) <> lower(coalesce(auth.jwt() ->> 'email', ''));

  IF auth.role() = 'authenticated' AND v_total > 0 AND v_vusantes > 0 THEN
    RAISE EXCEPTION 'RLS-010 : fuite — un utilisateur voit % ligne(s) qui ne sont pas la sienne', v_vusantes;
  END IF;
END $$;