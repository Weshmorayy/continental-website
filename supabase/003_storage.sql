-- =============================================================================
-- CONTINENTAL® — Supabase Storage
-- 003_storage.sql — Bucket d'images + politiques. Après 002_rls.sql.
-- =============================================================================
-- Un seul bucket public. « Public » signifie : les URL sont lisibles sans
-- jeton. C'est voulu pour les visuels de catalogue — ils s'affichent dans
-- une balise <img>, sans JavaScript ni authentification.
--
-- ⚠ Ce qui reste protégé : l'ÉCRITURE et la SUPPRESSION. Un visiteur peut
--   lire les images ; il ne peut ni en déposer une, ni en effacer une.
--   Si les visuels du site étaient privés, il faudrait un bucket privé et des
--   URL signées — et alors le rendu <img> direct ne fonctionnerait plus.
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'continental',
  'continental',
  true,
  10485760,  -- 10 Mo : au-delà, c'est un PDF de catalogue, pas une photo produit
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'
  ]
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Nettoyage des politiques d'un éventuel essai précédent, pour que le
-- script reste rejouable sans accumuler de règles contradictoires.
DROP POLICY IF EXISTS "continental_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "continental_admin_write"  ON storage.objects;
DROP POLICY IF EXISTS "continental_admin_delete" ON storage.objects;
DROP POLICY IF EXISTS "continental_admin_update" ON storage.objects;

-- ── lecture publique ──
CREATE POLICY "continental_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'continental');

-- ── dépôt : administrateur uniquement ──
CREATE POLICY "continental_admin_write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'continental' AND public.is_site_admin());

-- ── écrasement : administrateur uniquement ──
CREATE POLICY "continental_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'continental' AND public.is_site_admin())
  WITH CHECK (bucket_id = 'continental' AND public.is_site_admin());

-- ── suppression : administrateur uniquement ──
CREATE POLICY "continental_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'continental' AND public.is_site_admin());
-- =============================================================================