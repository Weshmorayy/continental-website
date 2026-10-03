-- =============================================================================
-- CONTINENTAL® — Données initiales
-- 004_seed.sql — Catalogue réel, zones de livraison, réglages, FAQ.
-- =============================================================================
-- Rejouable sans risque : tout passe par `ON CONFLICT ... DO UPDATE`.
-- Aucune donnée inventée : les prix, caractéristiques et zones proviennent des
-- fiches existantes du catalogue. Les coordonnées restent celles du
-- fichier de configuration, à remplacer dès que le client les confirme.
-- =============================================================================

-- ──────────────────────────────────────────────────────────── catégories ──
INSERT INTO public.categories (slug, label, position, intro) VALUES
  ('ventilateur-pied', 'Ventilateurs sur pied', 1,
   'Du 16 pouces pour la chambre au 50 cm industriel pour l''atelier.'),
  ('ventilateur-sol', 'Brasseurs d''air & sol', 2,
   'Structure métallique, grand débit d''air, pieds anti-vibrations.'),
  ('climatiseur',     'Climatiseurs Inverter', 3,
   'Split digital inverter tropicalisé, prévu pour le climat de Dakar.')
ON CONFLICT (slug) DO UPDATE
  SET label = EXCLUDED.label, position = EXCLUDED.position,
      intro = EXCLUDED.intro, updated_at = now();

-- ───────────────────────────────────────────────────────────── produits ──
-- `ref_` : la colonne s'appelle `ref_` car `ref` est un mot réservé SQL.
INSERT INTO public.products
  (slug, name, ref_, sku, category_id, price, image, image_alt, images,
   short_desc, features, specs, badge, in_stock, is_active, is_featured, position)
VALUES
(
  'ventilateur-pied-fs4011',
  'Ventilateur sur Pied 16" avec Télécommande',
  'FS4011-PRO', 'FS4011',
  (SELECT id FROM public.categories WHERE slug = 'ventilateur-pied'),
  30000, '/products/ventilateur-pied-fs4011.jpg',
  'Ventilateur sur pied Continental 16 pouces avec télécommande',
  ARRAY['/products/ventilateur-pied-fs4011.jpg'],
  'Moteur cuivre, télécommande et trois vitesses. Le ventilateur de chambre qui tient la saison.',
  ARRAY[
    'Moteur 100% cuivre haute endurance',
    'Télécommande de contrôle à distance',
    '3 vitesses de flux d''air avec minuterie',
    'Oscillation grand angle 90° et hauteur ajustable',
    'Conception ultra-silencieuse pour chambre et salon'
  ],
  '{"Diamètre":"16 pouces (40 cm)","Alimentation":"220V - 240V / 50Hz","Puissance":"55W","Moteur":"100% Cuivre bobiné","Contrôle":"Télécommande + Panneau tactile","Garantie":"2 ans Continental®"}'::jsonb,
  'Best-Seller', true, true, true, 1
),
(
  'ventilateur-sol-louisiane-45cm',
  'Ventilateur Brasseur d''Air Sol Métal 45cm',
  'VBR-45M', 'VBR-45M',
  (SELECT id FROM public.categories WHERE slug = 'ventilateur-sol'),
  30000, '/products/ventilateur-sol-louisiane-45cm.jpg',
  'Ventilateur de sol métallique Continental 45 cm',
  ARRAY['/products/ventilateur-sol-louisiane-45cm.jpg'],
  'Acier chromé et grand débit d''air pour les grands volumes.',
  ARRAY[
    'Structure métallique chromée ultra-robuste',
    '3 vitesses de ventilation à grand débit d''air',
    'Inclinaison verticale orientable à 120°',
    'Pieds stables avec patins anti-vibrations',
    'Idéal grands volumes, ateliers, bureaux et salons'
  ],
  '{"Diamètre":"45 cm (18\")","Puissance":"70W haute performance","Matériau":"Acier chromé + Pales aérodynamiques","Débit":"Brasseur d''air gros volume","Garantie":"2 ans Continental®"}'::jsonb,
  'Pro Métal', true, true, false, 2
),
(
  'ventilateur-industriel-vm56',
  'Ventilateur Industriel sur Pied Puissance Max',
  'VM-56PI', 'VM-56PI',
  (SELECT id FROM public.categories WHERE slug = 'ventilateur-pied'),
  30000, '/products/ventilateur-industriel-vm56.jpg',
  'Ventilateur industriel Continental 50 cm 120W',
  ARRAY['/products/ventilateur-industriel-vm56.jpg'],
  '120 W et un piètement en croix : pour les ateliers et les espaces chauds.',
  ARRAY[
    'Pales industrielles profilées gros flux',
    'Piètement lourd en croix pour une stabilité maximale',
    'Moteur haute intensité renforcé anti-surchauffe',
    'Oscillation automatique débrayable',
    'Conçu pour résister aux environnements chauds'
  ],
  '{"Diamètre":"50 cm (20\")","Alimentation":"230V / 50Hz","Puissance":"120W Industriel","Structure":"Acier renforcé noir mat","Garantie":"2 ans Continental®"}'::jsonb,
  'Haute Puissance', true, true, false, 3
),
(
  'climatiseur-split-pro-inverter',
  'Climatiseur Split Inverter 12000 BTU',
  'CT-12INV-PRO', 'CT-12INV',
  (SELECT id FROM public.categories WHERE slug = 'climatiseur'),
  195000, '/products/climatiseur-split-pro-inverter.jpg',
  'Climatiseur split inverter Continental 12000 BTU',
  ARRAY['/products/climatiseur-split-pro-inverter.jpg'],
  'Le format 12 000 BTU : la pièce de 20 à 30 m², avec l''économie Inverter en prime.',
  ARRAY[
    'Technologie Inverter : jusqu''à 60% d''économie d''énergie',
    'Refroidissement ultra-rapide spécial climat sahélien',
    'Filtre antibactérien et purification d''air',
    'Fonctionnement silencieux nocturne (21 dB)',
    'Gaz écologique R410A / R32 haute performance'
  ],
  '{"Capacité":"12 000 BTU (1.5 CV)","Technologie":"Digital Inverter Tropicalisé","Classe":"A+++ Énergie","Niveau sonore":"21 dB (Mode Silence)","Garantie":"2 ans compresseur & pièces"}'::jsonb,
  'Inverter Eco', true, true, true, 4
),
(
  'climatiseur-eco-inverter-gree',
  'Climatiseur Split Silencieux 9000 BTU',
  'CT-09ECO', 'CT-09ECO',
  (SELECT id FROM public.categories WHERE slug = 'climatiseur'),
  165000, '/products/climatiseur-eco-inverter-gree.jpg',
  'Climatiseur split 9000 BTU Continental pour chambre',
  ARRAY['/products/climatiseur-eco-inverter-gree.jpg'],
  '9000 BTU pensés pour une chambre de 15 à 25 m², traitement anti-corrosion bord de mer.',
  ARRAY[
    'Idéal pour chambres à coucher et petits espaces (15-25 m²)',
    'Télécommande intelligente avec capteur de température I-Feel',
    'Affichage LED masqué sur façade design',
    'Traitement anti-corrosion Gold Fin pour bord de mer (Dakar)',
    'Redémarrage automatique après coupure de courant'
  ],
  '{"Capacité":"9 000 BTU (1 CV)","Voltage":"220V - 240V","Revêtement":"Anti-corrosion Gold Fin","Télécommande":"LCD rétroéclairée incluse","Garantie":"2 ans Continental®"}'::jsonb,
  'Chambre Zen', true, true, false, 5
),
(
  'climatiseur-multi-split-18000btu',
  'Climatiseur Split Grand Salon 18000 BTU',
  'CT-18PWR', 'CT-18PWR',
  (SELECT id FROM public.categories WHERE slug = 'climatiseur'),
  245000, '/products/climatiseur-multi-split-18000btu.webp',
  'Climatiseur split 18000 BTU Continental grand salon',
  ARRAY['/products/climatiseur-multi-split-18000btu.webp'],
  '35 à 55 m², compresseur tropicalisé qui tient jusqu''à 55 °C dehors.',
  ARRAY[
    'Gros débit de froid conçu pour les grands salons et espaces commerciaux',
    'Flux d''air 4D multidirectionnel automatique',
    'Compresseur tropicalisé résistant jusqu''à 55°C extérieur',
    'Mode Turbo Rafraîchissement express en 30 secondes',
    'Télécommande ergonomique complète avec programmation 24h'
  ],
  '{"Capacité":"18 000 BTU (2 CV)","Compresseur":"Tropicalisé T3 (Jusqu''à 55°C)","Alimentation":"220-240V / 50Hz","Surface conseillée":"35 à 55 m²","Garantie":"2 ans Continental®"}'::jsonb,
  'Grand Salon', true, true, false, 6
)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, ref_ = EXCLUDED.ref_, category_id = EXCLUDED.category_id,
      price = EXCLUDED.price, image = EXCLUDED.image, image_alt = EXCLUDED.image_alt,
      images = EXCLUDED.images, features = EXCLUDED.features, specs = EXCLUDED.specs,
      badge = EXCLUDED.badge, in_stock = EXCLUDED.in_stock,
      is_featured = EXCLUDED.is_featured, position = EXCLUDED.position,
      updated_at = now();


-- ──────────────────────────────────────────────── zones de livraison ──
INSERT INTO public.shipping_zones (slug, name, price, delay, position) VALUES
  ('dakar-plateau',   'Dakar Plateau',                       0,    '24h',          1),
  ('medina-gueule-tapee', 'Médina / Gueule Tapée',           0,    '24h',          2),
  ('parcelles',       'Parcelles Assainies',                1500, '24–48h',       3),
  ('guediawaye',      'Guédiawaye',                          2000, '24–48h',       4),
  ('pikine',          'Pikine',                              2000, '48h',          5),
  ('rufisque',        'Rufisque',                            3500, '48–72h',       6)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, price = EXCLUDED.price,
      delay = EXCLUDED.delay, position = EXCLUDED.position;


-- ────────────────────────────────────────────────────────────── FAQ ──
INSERT INTO public.faqs (question, answer, category, position) VALUES
  ('Quelle est la garantie sur les ventilateurs et climatiseurs ?',
   'Tous les produits Continental® sont garantis 2 ans. Pour les climatiseurs, la garantie couvre le compresseur et les pièces.',
   'garantie', 1),
  ('Combien coûte la livraison à Dakar ?',
   'La livraison est offerte sur Dakar Plateau et Médina / Gueule Tapée. Elsewhere dans l''agglomération, elle part de 1 500 FCFA selon la zone.',
   'livraison', 2),
  ('Livrez-vous en dehors de Dakar ?',
   'Oui, nous livrons partout au Sénégal. Les délais vont de 24h à 72h selon la zone, indiqué avant validation de la commande.',
   'livraison', 3),
  ('Comment passer commande ?',
   ' Whatsapp est le plus rapide : envoyez-nous le modèle qui vous intéresse, on vous confirme la disponibilité et le prix de livraison.',
   'commande', 4),
  ('Quel clim choisir pour ma chambre ?',
   'Comptez 1 000 BTU par 10 m². Une chambre de 20 m² demande un 9 000 BTU ; un salon de 30 m², un 12 000 BTU.',
   'climatisation', 5),
  ('Que faut-il prévoir pour l''installation d''un clim ?',
   'Prévoyez une sortie d''air à l''extérieur. L''installation est proposée avec le produit et se fait par un technicien.',
   'climatisation', 6)
ON CONFLICT DO NOTHING;

-- L'IDEMPOTENCE : sans contrainte d'unicité sur `faqs`, le `ON CONFLICT DO
-- NOTHING` ci-dessus ne protège de rien. On nettoie les doublons par contenu
-- plutôt que d'ajouter une contrainte qui caserait avec des lignes existantes.
DELETE FROM public.faqs a USING public.faqs b
 WHERE a.ctid < b.ctid AND a.question = b.question;


-- ────────────────────────────────────────────────────────── réglages ──
-- ⚠ Le téléphone et l'adresse sont ceux du fichier de configuration, encore
--   partiels. À compléter dès que le client les transmet.
UPDATE public.site_settings SET
  contact = jsonb_build_object(
    'phone',    '+221 77 000 00 00',
    'whatsapp', '221770000000',
    'email',    '',
    'address',  '',
    'city',     'Dakar',
    'country',  'Sénégal'
  ),
  social = jsonb_build_object(
    'facebook', '', 'instagram', '', 'tiktok', ''
  ),
  hours = jsonb_build_object(
    'weekdays', '8h – 20h', 'saturday', '9h – 18h', 'sunday', 'Fermé'
  ),
  seo = jsonb_build_object(
    'title',       'Continental® — Ventilateurs & Climatiseurs à Dakar',
    'description', 'Ventilateurs sur pied, brasseurs d''air et climatiseurs split inverter. Garantie 2 ans, livraison Dakar et régions.',
    'keywords', ARRAY[
      'ventilateur sur pied Dakar','ventilateur mural Dakar','climatiseur Dakar',
      'Continental ventilateur prix','ventilateur télécommande Dakar','climatiseur inverter Sénégal'
    ],
    'ogImage', '/og-image.jpg'
  ),
  payments = jsonb_build_object(
    'wave', true, 'orangeMoney', true, 'freeMoney', true, 'cash', true
  ),
  delivery = jsonb_build_object(
    'available', true, 'freeFrom', 50000
  ),
  legal = jsonb_build_object(
    'company', 'Continental®', 'rcm', '', 'address', '', 'phone', '+221 77 000 00 00'
  ),
  updated_at = now()
WHERE id = 1;
-- =============================================================================