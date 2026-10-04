-- =============================================================================
-- CONTINENTAL® — RLS manquant sur deux tables
-- 008_fix_rls.sql
-- =============================================================================
-- ⚠ DÉCOUVERT PAR UN TEST, PAS PAR UNE RELECTURE.
--
--   `media` et `site_backups` portaient bien des politiques… mais
--   `relrowsecurity = false`. Sans `ENABLE ROW LEVEL SECURITY`, PostgreSQL
--   n'évalue AUCUNE politique : il les ignore purement et simplement. Les
--   règles semblaient protectrices, et ne protégeaient rien.
--
--   Concrètement : `site_backups` contient des instantanés du catalogue —
--   noms, prix, visuels. La clé `anon` étant publique par nature, cette
--   épingleles exposait à quiconque.
--
--   Ce défaut est resté invisible tant que les deux tables étaient vides :
--   le contrôle « anon ne voit aucune ligne » passait alors pour la bonne
--   raison — aucune donnée, aucune politique, aucun accès. Il passait donc à
--   vide. Un test de sécurité doit s'exécuter sur des données RÉELLES, sinon
--   il ne prouve rien.
--
--   `FORCE` est ajouté sur ces DEUX tables : rien ne les écrit autrement que
--   par l'application, donc aucun script de migration n'est concerné.
-- =============================================================================

ALTER TABLE public.media        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media        FORCE  ROW LEVEL SECURITY;
ALTER TABLE public.site_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_backups FORCE  ROW LEVEL SECURITY;

-- Les politiques `mod_read` / `mod_write` créées par 007 existent déjà et sont
-- désormais EFFECTIVES. On les recrée pour rendre ce fichier autonome.

DROP POLICY IF EXISTS mod_read ON public.media;
CREATE POLICY mod_read ON public.media
  FOR SELECT TO authenticated
  USING (public.can_module('media', 'read'));

DROP POLICY IF EXISTS mod_write ON public.media;
CREATE POLICY mod_write ON public.media
  FOR ALL TO authenticated
  USING      (public.can_module('media', 'write'))
  WITH CHECK (public.can_module('media', 'write'));

DROP POLICY IF EXISTS mod_read ON public.site_backups;
CREATE POLICY mod_read ON public.site_backups
  FOR SELECT TO authenticated
  USING (public.can_module('backups', 'read'));

DROP POLICY IF EXISTS mod_write ON public.site_backups;
CREATE POLICY mod_write ON public.site_backups
  FOR ALL TO authenticated
  USING      (public.can_module('backups', 'write'))
  WITH CHECK (public.can_module('backups', 'write'));

-- ═══════════════════════════════════════ garde-fou de non-régression ══════
-- Toute table publique DOIT avoir RLS activé. Placé dans la base, ce contrôle
-- échoue si quelqu'un ajoute une table sans y penser.
--
-- ⚠ `FORCE` n'est PAS exigé ici, et ce n'est pas un oubli.
--   `FORCE` assujettit aussi le PROPRIÉTAIRE de la table. Or le propriétaire
--   est `postgres`, qui est également le rôle qui applique les migrations et
--   les données de départ. Avec `FORCE`, un `next.config` égaré, ou un script
--   de maintenance, se retrouverait bloqué — et l'on diagnostiquerait à tort
--   une panne RLS.
--
--   `ENABLE` suffit à protéger le cas réel : l'application se connecte avec
--   `anon` ou `authenticated`, jamais propriétaire. `FORCE` n'apporterait rien
--   ici qu'au prix d'un mode de panne.
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN
    SELECT c.relname FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relkind = 'r'
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c2
        JOIN pg_namespace n2 ON n2.oid = c2.relnamespace
       WHERE n2.nspname = 'public' AND c2.relname = t AND c2.relrowsecurity
    ) THEN
      RAISE EXCEPTION 'table publique % sans RLS actif', t;
    END IF;
  END LOOP;
  RAISE NOTICE 'toutes les tables publiques ont RLS actif';
END $$;
-- =============================================================================
