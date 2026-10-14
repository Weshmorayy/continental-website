-- ══════════════════════════════════════════════════════════════════════════
-- Téléviseur — trois tailles d'écran sous une seule fiche
-- ══════════════════════════════════════════════════════════════════════════
--
-- Le client a donné trois tailles et leurs prix :
--
--   32 pouces   55 000 FCFA
--   55 pouces  205 000 FCFA
--   65 pouces  280 000 FCFA
--
-- Elles vivent sur la MÊME fiche (`tv-smart-ct-43sr`), comme les trois
-- puissances du climatiseur : une seule adresse, un seul produit au catalogue,
-- et le visiteur choisit sa taille sur la page. La colonne `variants` porte la
-- liste ; le prix de l'entrée de base devient celui de la plus petite taille,
-- pour que la tuile du catalogue annonce « À partir de 55 000 FCFA ».
--
-- ── Ce qui a dû être retiré, et pourquoi ──────────────────────────────────
-- La fiche décrivait UN SEUL appareil : le CT-43SR. Le nom, la description,
-- la définition (« Full HD 1920 × 1080 ») et la taille (« 43 pouces ») étaient
-- donc vrais pour lui seul. Affichés sous un sélecteur qui propose 32, 55 et
-- 65 pouces, ils devenaient faux — la fiche aurait annoncé du Full HD 43 pouces
-- à un client qui vient de choisir un 65 pouces.
--
-- Ces mentions ont été retirées, PAS remplacées : nous n'avons reçu ni la
-- définition ni la référence de chaque taille. Inventer « 4K » pour le 65
-- pouces serait une affirmation que personne n'a vérifiée. Chaque taille ne
-- porte donc que ce que le client a réellement donné — sa taille et son prix.
--
-- Il reste à fournir, taille par taille : la référence fabricant, la
-- définition de la dalle et le visuel. La référence de la fiche est laissée
-- vide pour la même raison : afficher « CT-43SR » sur un 32 pouces serait faux.
--
-- Rejouable : la mise à jour est idempotente.
-- ══════════════════════════════════════════════════════════════════════════

UPDATE public.products
SET
  name        = 'Téléviseur Smart Android TV',

  -- La référence de base décrivait le 43 pouces, qui n'est plus proposé.
  -- Vide plutôt que fausse : chaque taille attend la sienne.
  ref_        = NULL,

  -- Prix de la plus petite taille : c'est lui qui s'affiche en « À partir de ».
  price       = 55000,

  short_desc  = 'Téléviseur connecté sous Android TV, Wi-Fi intégré. Trois tailles d''écran au choix.',

  description = 'Nos téléviseurs tournent sous Android TV : les applications du '
                'Play Store sont accessibles depuis la télécommande. La réduction '
                'du bruit numérique sert les chaînes hertziennes, souvent dégradées '
                'chez nous. Le Wi-Fi est intégré, pas un adaptateur.',

  -- « Full HD 1920 × 1080 » décrit le 43 pouces : retiré tant que la
  -- définition de chaque taille n'est pas connue.
  -- `features` est un tableau Postgres (`text[]`), pas du JSON.
  features    = ARRAY[
                  'Android TV',
                  'Wi-Fi intégré',
                  'Réduction du bruit numérique',
                  'Économie d''énergie',
                  'Ports USB et HDMI',
                  'Télécommande incluse'
                ],

  -- « Taille » et « Définition » descendent dans chaque modèle : ce sont
  -- exactement les deux valeurs qui changent d'une taille à l'autre.
  specs       = '{"Réseau":"Wi-Fi","Connectique":"USB, HDMI","Technologie":"Android TV"}'::jsonb,

  image_alt   = 'Téléviseur Continental Android TV sur pied',

  variants    = '[
    {
      "id": "v-tv-32",
      "label": "32 pouces",
      "price": 55000,
      "specs": { "Taille": "32 pouces" }
    },
    {
      "id": "v-tv-55",
      "label": "55 pouces",
      "price": 205000,
      "specs": { "Taille": "55 pouces" }
    },
    {
      "id": "v-tv-65",
      "label": "65 pouces",
      "price": 280000,
      "specs": { "Taille": "65 pouces" }
    }
  ]'::jsonb,

  updated_at  = now()
WHERE slug = 'tv-smart-ct-43sr';

-- Contrôle : trois modèles, le prix de base aligné sur le premier.
DO $$
DECLARE
  n INTEGER;
  p NUMERIC;
BEGIN
  SELECT jsonb_array_length(variants), price
    INTO n, p
    FROM public.products
   WHERE slug = 'tv-smart-ct-43sr';

  IF n <> 3 THEN
    RAISE EXCEPTION 'Le téléviseur doit porter 3 modèles, il en porte %', n;
  END IF;

  IF p <> 55000 THEN
    RAISE EXCEPTION 'Le prix de base doit être 55 000, il vaut %', p;
  END IF;

  RAISE NOTICE 'Téléviseur : % modèles, prix de base %.', n, p;
END $$;
