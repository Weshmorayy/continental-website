-- 011 — Réparer les images stockées comme chemin au lieu d'adresse
--
-- L'ancien sélecteur d'image enregistrait `media.path` (« produits/photo.png »)
-- au lieu de `media.url`. Or le site résout un chemin nu contre sa propre
-- racine : l'image demandée était https://<domaine>/produits/photo.png → 404.
-- Le téléversement réussissait, la ligne s'enregistrait, et rien ne
-- s'affichait. Aucun signal d'erreur.
--
-- Ce script rattache les valeurs orphelines à leur adresse publique. Il ne
-- touche que les valeurs qui correspondent EXACTEMENT à un `media.path` :
-- un visuel de `public/` (« /products/x.jpg ») n'a pas d'équivalent dans la
-- médiathèque et reste donc intact.

UPDATE public.products p
   SET image = m.url
  FROM public.media m
 WHERE p.image = m.path
   AND p.image NOT LIKE 'http%'
   AND p.image NOT LIKE '/products/%';

UPDATE public.banners b
   SET image = m.url
  FROM public.media m
 WHERE b.image = m.path
   AND b.image IS NOT NULL
   AND b.image NOT LIKE 'http%'
   AND b.image NOT LIKE '/products/%'
   AND b.image NOT LIKE '/aesthetic/%';

UPDATE public.content_blocks c
   SET image = m.url
  FROM public.media m
 WHERE c.image = m.path
   AND c.image IS NOT NULL
   AND c.image NOT LIKE 'http%'
   AND c.image NOT LIKE '/products/%'
   AND c.image NOT LIKE '/aesthetic/%';

-- Filet : plus aucune image ne doit être un chemin brut de la médiathèque.
DO $$
DECLARE
  v_restant integer;
BEGIN
  SELECT count(*) INTO v_restant FROM (
    SELECT image FROM public.products
    UNION ALL SELECT image FROM public.banners
    UNION ALL SELECT image FROM public.content_blocks
  ) t
  WHERE t.image IS NOT NULL
    AND t.image IN (SELECT path FROM public.media);

  IF v_restant > 0 THEN
    RAISE EXCEPTION 'IMG-011 : % image(s) pointent encore vers un chemin brut', v_restant;
  END IF;
END $$;