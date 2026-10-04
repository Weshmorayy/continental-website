-- =============================================================================
-- CONTINENTAL® — Contenu éditorial initial
-- 006_content_seed.sql
-- =============================================================================
-- Reprend mot pour mot ce que le site affichait en code dur. Rien n'est
-- inventé : ces textes sont ceux de l'interface actuelle, et cette migration
-- n'a donc pas à l'écran l'air de changer.
--
-- La clé `data` porte les champs propres à un bloc, pour éviter d'ajouter une
-- colonne par section. C'est du JSON voluntaryment petit et stable.
--
-- Idempotent : `ON CONFLICT (slot, key) DO UPDATE`.
-- =============================================================================

-- ════════════════════════════════════════════════════════════════════ héros ══
INSERT INTO public.content_blocks
  (slot, key, eyebrow, title, subtitle, cta_label, cta_href, image, image_alt, data, position)
VALUES
('hero', 'hero',
 'Disponible maintenant',
 'La fraîcheur, sans le bruit.',
 'Ventilateurs et climatiseurs Inverter sélectionnés pour le climat de Dakar. Moteur bobiné cuivre, fonctionnement discret et garantie fabricant 2 ans.',
 'Voir le catalogue', '/catalogue',
 '/products/ventilateur-pied-fs4011.jpg',
 'Ventilateur sur pied Continental FS4011 avec télécommande',
 '{"cta2_label":"Commander sur WhatsApp","cta2_href":"wa:","caption":"Ventilateur Télécommande 16\"","caption_price":"30.000 FCFA"}'::jsonb,
 1)
ON CONFLICT (slot, key) DO UPDATE SET
  eyebrow=EXCLUDED.eyebrow, title=EXCLUDED.title, subtitle=EXCLUDED.subtitle,
  cta_label=EXCLUDED.cta_label, cta_href=EXCLUDED.cta_href, image=EXCLUDED.image,
  image_alt=EXCLUDED.image_alt, data=EXCLUDED.data, updated_at=now();


-- ══════════════════════════════════════════════════════════════════ gammes ══
INSERT INTO public.content_blocks (slot, key, eyebrow, title, body, meta, cta_label, cta_href, image, image_alt, position) VALUES
('gammes', 'heading', 'Nos deux gammes', 'Deux façons de tenir la chaleur.', NULL, NULL, NULL, NULL, NULL, NULL, 0),

('gammes', 'gamme-1', 'Gamme ventilation',
 'Ventilateurs pied, sol & muraux',
'Brasseurs d''air gros débit, ventilateurs silencieux sur pied à télécommande et modèles industriels renforcés."',
 'Modèles dès 30.000 FCFA',
 'Voir les ventilateurs', '/catalogue?cat=ventilateur-pied',
 '/aesthetic/aesthetic-fan-livingroom.jpg',
 'Ventilateur Continental dans un salon lumineux et aéré', 1),

('gammes', 'gamme-2', 'Gamme climatisation',
 'Climatiseurs split Inverter tropicalisés',
'Splits de 9.000 à 18.000 BTU, jusqu''à 60% d''économie d''énergie grâce au compresseur Inverter."',
 '9.000 · 12.000 · 18.000 BTU',
 'Découvrir les splits', '/catalogue?cat=climatiseur',
 '/aesthetic/aesthetic-breeze-bedroom-1.jpg',
 'Chambre fraîche avec climatiseur split mural', 2),

('gammes', 'footer', NULL,
 'Livraison à Dakar et banlieue · Paiement à la réception', NULL, NULL, NULL, NULL, NULL,
 '{"phone_link":true}'::jsonb, 3)
ON CONFLICT (slot, key) DO UPDATE SET
  eyebrow=EXCLUDED.eyebrow, title=EXCLUDED.title, body=EXCLUDED.body, meta=EXCLUDED.meta,
  cta_label=EXCLUDED.cta_label, cta_href=EXCLUDED.cta_href, image=EXCLUDED.image,
  image_alt=EXCLUDED.image_alt, data=EXCLUDED.data, position=EXCLUDED.position, updated_at=now();


-- ══════════════════════════════════════════════════════════════ engagements ══
INSERT INTO public.content_blocks (slot, key, eyebrow, title, body, icon, num, position) VALUES
('engagements', 'heading', 'Nos engagements', 'Ce qui nous sépare du reste.', NULL, NULL, NULL, 0),

('engagements', 'engagement-1', NULL,
 'Moteur 100% cuivre pur',
'Nos bobinages en cuivre résistent aux longues heures d''utilisation continue sous forte chaleur, là où les moteurs en aluminium surchauffent."',
 'Award', '01', 1),

('engagements', 'engagement-2', NULL,
 'Garantie constructeur 2 ans',
 '24 mois pièces et main-d''œuvre, avec un service technique basé à Dakar qui intervient rapidement.',
 'ShieldCheck', '02', 2),

('engagements', 'engagement-3', NULL,
 'Performance énergétique',
 'Compresseurs Inverter tropicalisés et pales aérodynamiques : un débit d''air maximal pour une facture maîtrisée.',
 'Zap', '03', 3),

('engagements', 'engagement-4', NULL,
 'Paiement à la livraison',
 'Dakar Plateau, Almadies, Ouakam, Médina, Guédiawaye, Pikine et Rufisque. Vous testez l''appareil avant de valider.',
 'Truck', '04', 4)
ON CONFLICT (slot, key) DO UPDATE SET
  eyebrow=EXCLUDED.eyebrow, title=EXCLUDED.title, body=EXCLUDED.body,
  icon=EXCLUDED.icon, num=EXCLUDED.num, position=EXCLUDED.position, updated_at=now();


-- ══════════════════════════════════════════════════════════════ bestseller ══
-- `data.product_slug` : le site affichera le produit DU CATALOGUE. Changer le
-- bestseller se fait donc en changeant ce slug, sans dupliquer la fiche.
INSERT INTO public.content_blocks (slot, key, eyebrow, title, body, image, image_alt, data, position) VALUES
('bestseller', 'bestseller', 'Notre plus vendu',
 'Climatiseur Split Inverter 12000 BTU Tropicalisé', NULL,
 '/products/climatiseur-split-pro-inverter.jpg',
 'Climatiseur split Continental 12000 BTU',
 '{"product_slug":"climatiseur-split-pro-inverter","badge":"Modèle bestseller","features":["Compresseur Inverter intelligent : jusqu''à 60% d''économie d''énergie","Mode Nuit Ultra Silencieux (21 dB) pour un sommeil sans perturbation","Revêtement Gold Fin résistant à la corrosion saline","Filtre antibactérien haute densité et purification active de l''air"]}'::jsonb,
 1)
ON CONFLICT (slot, key) DO UPDATE SET
  eyebrow=EXCLUDED.eyebrow, title=EXCLUDED.title, body=EXCLUDED.body, image=EXCLUDED.image,
  image_alt=EXCLUDED.image_alt, data=EXCLUDED.data, updated_at=now();


-- ═══════════════════════════════════════════════════════════════ livraison ══
INSERT INTO public.content_blocks (slot, key, eyebrow, title, body, meta, position) VALUES
('livraison', 'heading', 'Livraison & paiement',
 'Livré chez vous, payé à la réception.', NULL, NULL, 0),
('livraison', 'zones-title', NULL, 'Délais par secteur', NULL, NULL, 1),
('livraison', 'proforma', NULL, 'Besoin d''une facture proforma ?',
 'Pour les entreprises et les achats en volume, nous établissons une facture proforma sur demande.',
 'Demander une facture proforma', 2)
ON CONFLICT (slot, key) DO UPDATE SET
  eyebrow=EXCLUDED.eyebrow, title=EXCLUDED.title, body=EXCLUDED.body,
  meta=EXCLUDED.meta, position=EXCLUDED.position, updated_at=now();


-- ════════════════════════════════════════════════════════ apercu ══
INSERT INTO public.content_blocks (slot, key, title, body, position) VALUES
('catalogue-apercu', 'heading', 'Le catalogue en bref', NULL, 0),
('catalogue-apercu', 'cta', NULL, 'Voir tout le catalogue', 1)
ON CONFLICT (slot, key) DO UPDATE SET
  title=EXCLUDED.title, body=EXCLUDED.body, position=EXCLUDED.position, updated_at=now();

DELETE FROM public.content_blocks WHERE slot = 'catalogue-apercu' AND key = 'heading' AND title IS NULL;
-- =============================================================================
