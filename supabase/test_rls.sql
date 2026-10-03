-- =============================================================================
-- Vérification RLS — Continental®
-- Exécuter avec le rôle `postgres`, mais en basculant explicitement sur
-- `anon`. C'est le SEUL test valable : `postgres` possède les tables et
-- contourne RLS, donc tout semblerait fonctionner.
--
-- ⚠ DEUX RÉGIMES D'ÉCHEC, ET ILS NE SE RESSEMBLENT PAS. Les confondre est la
--   source d'erreur la plus fréquente des tests RLS :
--
--   • INSERT sans politique applicable  → PostgreSQL LEVE une exception.
--   • SELECT / UPDATE / DELETE sans     → SUCCÈS SILENCIEUX. Zéro ligne,
--     politique applicable                AUCUNE erreur. Le code voit « ok »
--                                       et l'écran affiche « enregistré ».
--
--   Ce fichier teste donc les deux régimes séparément : `compte_lignes()`
--   pour le second, un bloc BEGIN/EXCEPTION pour le premier.
-- =============================================================================

SET ROLE anon;

DO $$
DECLARE
  n      BIGINT;
  label  TEXT;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════ ANON — ce que le visiteur DOIT voir ════';

  BEGIN PERFORM 1 FROM public.categories LIMIT 1;
    RAISE NOTICE 'PASS  lit les catégories';
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'FAIL  lit les catégories — %', SQLERRM; END;

  BEGIN PERFORM 1 FROM public.site_settings LIMIT 1;
    RAISE NOTICE 'PASS  lit les réglages du site';
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'FAIL  lit les réglages — %', SQLERRM; END;

  BEGIN PERFORM 1 FROM public.shipping_zones LIMIT 1;
    RAISE NOTICE 'PASS  lit les zones de livraison';
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'FAIL  lit les zones — %', SQLERRM; END;

  BEGIN PERFORM 1 FROM public.faqs LIMIT 1;
    RAISE NOTICE 'PASS  lit la FAQ';
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'FAIL  lit la FAQ — %', SQLERRM; END;

  -- Filtrage SILENCIEUX : un produit inactif doit disparaître sans erreur.
  SELECT count(*) INTO n FROM public.products WHERE NOT is_active;
  IF n = 0 THEN RAISE NOTICE 'PASS  aucun produit inactif ne fuite';
  ELSE RAISE NOTICE 'FAIL  % produit(s) inactif(s) visibles par anon', n; END IF;

  RAISE NOTICE '';
  RAISE NOTICE '════ ANON — ce que le visiteur NE DOIT PAS voir ════';
  RAISE NOTICE '        (lecture filtrée en silence : le compte doit valoir 0)';

  SELECT count(*) INTO n FROM public.orders;
  IF n = 0 THEN RAISE NOTICE 'PASS  ne lit AUCUNE commande';
  ELSE RAISE NOTICE 'FAIL  % commande(s) lisibles par anon', n; END IF;

  SELECT count(*) INTO n FROM public.leads;
  IF n = 0 THEN RAISE NOTICE 'PASS  ne lit AUCUNE demande client';
  ELSE RAISE NOTICE 'FAIL  % demande(s) lisibles par anon', n; END IF;

  SELECT count(*) INTO n FROM public.site_admins;
  IF n = 0 THEN RAISE NOTICE 'PASS  ne lit pas la liste des comptes';
  ELSE RAISE NOTICE 'FAIL  % compte(s) administrateur exposé(s)', n; END IF;

  SELECT count(*) INTO n FROM public.site_backups;
  IF n = 0 THEN RAISE NOTICE 'PASS  ne lit pas les sauvegardes';
  ELSE RAISE NOTICE 'FAIL  % sauvegarde(s) lisibles', n; END IF;

  SELECT count(*) INTO n FROM public.media;
  IF n = 0 THEN RAISE NOTICE 'PASS  ne lit pas la médiathèque';
  ELSE RAISE NOTICE 'FAIL  % média(s) lisibles', n; END IF;

  RAISE NOTICE '';
  RAISE NOTICE '════ ANON — écritures interdites (INSERT → exception attendue) ════';

  BEGIN
    INSERT INTO public.products (slug, name, price) VALUES ('pirate', 'Injecté', 100);
    RAISE NOTICE 'FAIL  création d''un produit ACCEPTÉE';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS  ne peut pas créer un produit';
  END;

  BEGIN
    INSERT INTO public.site_admins (email, role) VALUES ('pirate@exemple.com', 'admin');
    RAISE NOTICE 'FAIL  auto-nomination admin ACCEPTÉE';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS  ne peut pas se nommer administrateur';
  END;

  RAISE NOTICE '';
  RAISE NOTICE '════ ANON — écritures interdites (UPDATE/DELETE → 0 ligne attendue) ════';
  RAISE NOTICE '        (aucune erreur ne sera levée : c''est bien le piège)';

  UPDATE public.products SET price = 1;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n = 0 THEN RAISE NOTICE 'PASS  ne modifie aucun produit (0 ligne)';
  ELSE RAISE NOTICE 'FAIL  % produit(s) modifiables par anon !', n; END IF;

  DELETE FROM public.products;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n = 0 THEN RAISE NOTICE 'PASS  ne supprime aucun produit (0 ligne)';
  ELSE RAISE NOTICE 'FAIL  % produit(s) supprimables par anon !', n; END IF;

  UPDATE public.site_settings SET contact = '{"phone":"000"}'::jsonb;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n = 0 THEN RAISE NOTICE 'PASS  ne modifie pas les réglages (0 ligne)';
  ELSE RAISE NOTICE 'FAIL  les réglages sont modifiables par anon !'; END IF;

  UPDATE public.leads SET status = 'spam';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n = 0 THEN RAISE NOTICE 'PASS  ne modifie aucune demande (0 ligne)';
  ELSE RAISE NOTICE 'FAIL  % demande(s) modifiables par anon !', n; END IF;

  RAISE NOTICE '';
  RAISE NOTICE '════ ANON — écritures légitimes ════';

  BEGIN
    INSERT INTO public.orders (
      ref_command, customer_name, customer_phone, subtotal, total_amount, items
    ) VALUES (
      'TEST-RLS-' || substr(md5(random()::TEXT), 1, 8),
      'Client Test', '+221 77 000 00 00', 30000, 30000, '[]'::jsonb
    );
    RAISE NOTICE 'PASS  peut passer une commande';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'FAIL  impossible de passer commande — %', SQLERRM;
  END;

  -- Fraude : commander directement en « livrée ».
  BEGIN
    INSERT INTO public.orders (
      ref_command, customer_name, customer_phone, order_status
    ) VALUES ('FRAUDE-RLS-1', 'Fraudeur', '+221 00 00 00 00', 'delivered');
    RAISE NOTICE 'FAIL  commande en « livrée » ACCEPTÉE !';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS  ne peut pas commander en « livrée »';
  END;

  BEGIN
    INSERT INTO public.leads (kind, name, phone, message)
    VALUES ('contact', 'Test RLS', '+221 77 000 00 00', 'essai');
    RAISE NOTICE 'PASS  peut envoyer une demande de contact';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'FAIL  formulaire de contact cassé — %', SQLERRM;
  END;

  -- Fraude : s'auto-marquer « traité ».
  BEGIN
    INSERT INTO public.leads (kind, name, status) VALUES ('contact', 'Fraudeur 2', 'done');
    RAISE NOTICE 'FAIL  demande en « traitée » ACCEPTÉE !';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS  ne peut pas s''auto-marquer comme traitée';
  END;

  RAISE NOTICE '';
  RAISE NOTICE '════ fin — aucun FAIL ne doit figurer ci-dessus ════';
END $$;

RESET ROLE;
-- Nettoyage des données de test (nécessite les droits du propriétaire).
DELETE FROM public.orders WHERE ref_command LIKE 'TEST-RLS-%' OR ref_command LIKE 'FRAUDE-RLS-%';
DELETE FROM public.leads  WHERE name IN ('Test RLS', 'Fraudeur 2');
DELETE FROM public.products WHERE slug = 'pirate';
DELETE FROM public.site_admins WHERE email = 'pirate@exemple.com';
-- =============================================================================