-- =============================================================================
-- CONTINENTAL® — Contenu des pages internes
-- 009_pages_seed.sql
-- =============================================================================
-- Reprend mot pour mot les textes aujourd'hui écrits dans les composants.
-- Rien n'est invente : ce sont les memes phrases, deplacees en base pour
-- devenir modifiables.
--
-- Les lignes sont produites par un generateur qui garantit le nombre de
-- colonnes. Redigees a la main, elles se trompaient regulierement de
-- longueur, et PostgreSQL indique alors seulement « VALUES lists must all be
-- the same length », sans dire quelle ligne ni quel champ.
-- =============================================================================

INSERT INTO public.content_blocks (slot, key, eyebrow, title, body, meta, image, image_alt, icon, num, data, position) VALUES
('a-propos', 'hero', 'La marque', 'L''électroménager pensé pour Dakar.', 'Continental® est le spécialiste sénégalais de la ventilation haute performance et de la climatisation Inverter tropicalisée. Des produits durables, sélectionnés pour durer sous les fortes chaleurs et les contraintes du réseau électrique local.', NULL, '/aesthetic/aesthetic-breeze-bedroom-2.jpg', 'Ventilateur Continental® dans une chambre', NULL, NULL, '{"cta_label": "Voir le catalogue", "cta2_label": "Commander sur WhatsApp"}'::jsonb, 0),
('a-propos', 'stat-1', NULL, NULL, NULL, 'Catalogue disponible', NULL, NULL, NULL, '01', '{"value": "6+", "label": "Modèles Ventilateurs"}'::jsonb, 1),
('a-propos', 'stat-2', NULL, NULL, NULL, 'De 9.000 à 18.000 BTU', NULL, NULL, NULL, '02', '{"value": "3+", "label": "Gammes Climatiseurs"}'::jsonb, 2),
('a-propos', 'stat-3', NULL, NULL, NULL, 'Pièces & main-d''œuvre', NULL, NULL, NULL, '03', '{"value": "2 Ans", "label": "Garantie Fabricant"}'::jsonb, 3),
('a-propos', 'stat-4', NULL, NULL, NULL, 'Bobinage moteur', NULL, NULL, NULL, '04', '{"value": "100%", "label": "Cuivre Pur"}'::jsonb, 4),
('a-propos', 'mission', 'Notre mission', 'Rendre la fraîcheur accessible.', 'À Dakar, la chaleur n''est pas un confort : c''est une réalité quotidienne que chaque foyer doit affronter. Continental® est née de la conviction qu''un bon appareil de ventilation ou de climatisation ne devrait pas être un luxe inaccessible.', NULL, '/aesthetic/aesthetic-fan-livingroom.jpg', 'Ventilateur Continental® dans un salon', NULL, NULL, '{"body2": "Nos appareils sont rigoureusement sélectionnés pour leur endurance dans les conditions climatiques locales, leur rapport performance/prix, et leur facilité d''entretien.", "body3": "Chaque ventilateur, chaque climatiseur que nous commercialisons est testé pour fonctionner de façon optimale sous des températures atteignant 45°C, avec des variations de tension fréquentes propres au réseau SENELEC.", "cta_label": "Découvrir la gamme"}'::jsonb, 5),
('a-propos', 'engagements', 'Nos engagements', 'Les valeurs qui guident Continental®.', 'Une marque dakarois, une équipe dakaroise, des produits choisis pour durer ici.', NULL, NULL, NULL, NULL, NULL, '{}'::jsonb, 6),
('a-propos', 'value-1', NULL, 'Qualité sans compromis', 'Chaque appareil est soumis à un protocole de contrôle rigoureux avant livraison. Moteurs cuivre pur, pales aérodynamiques et électronique certifiée pour des années d''usage intensif.', NULL, NULL, NULL, 'Award', '01', '{}'::jsonb, 7),
('a-propos', 'value-2', NULL, 'Conçu pour le climat sahélien', 'Les appareils Continental® sont sélectionnés et testés pour résister aux conditions extrêmes de Dakar : températures élevées, coupures de courant fréquentes et air chargé en humidité.', NULL, NULL, NULL, 'Wind', '02', '{}'::jsonb, 8),
('a-propos', 'value-3', NULL, 'Service de proximité', 'Une équipe locale disponible 7 jours sur 7 pour le conseil d''achat, la livraison rapide et les interventions SAV à domicile dans toute la région de Dakar.', NULL, NULL, NULL, 'Users', '03', '{}'::jsonb, 9),
('a-propos', 'value-4', NULL, 'Ancrage dakarois', 'Continental® est une marque implantée à Dakar, au service des foyers, entreprises et commerces sénégalais. Chaque commande est traitée localement par notre équipe.', NULL, NULL, NULL, 'MapPin', '04', '{}'::jsonb, 10),
('a-propos', 'cta', NULL, 'Besoin d''un conseil avant d''acheter ?', 'Équipe locale à Dakar, Sénégal — disponible 7 jours sur 7.', NULL, NULL, NULL, NULL, NULL, '{"cta1": "Commander sur WhatsApp", "cta2": "Garantie & SAV"}'::jsonb, 11)
ON CONFLICT (slot, key) DO UPDATE SET
  eyebrow=EXCLUDED.eyebrow, title=EXCLUDED.title, body=EXCLUDED.body, meta=EXCLUDED.meta, image=EXCLUDED.image, image_alt=EXCLUDED.image_alt, icon=EXCLUDED.icon, num=EXCLUDED.num, data=EXCLUDED.data, position=EXCLUDED.position,
  updated_at=now();

INSERT INTO public.content_blocks (slot, key, eyebrow, title, body, meta, icon, num, data, position) VALUES
('garantie', 'hero', 'Le service après-vente', 'Garantie fabricant 24 mois.', 'Chaque appareil Continental® bénéficie d''une garantie officielle de 24 mois pièces et main-d''œuvre à compter de la date d''achat.', NULL, NULL, NULL, '{"cta1": "Déclarer une panne"}'::jsonb, 0),
('garantie', 'summary', 'En résumé', NULL, NULL, NULL, NULL, NULL, '{}'::jsonb, 1),
('garantie', 'figure-1', NULL, NULL, 'Couverture complète 2 ans, sans frais supplémentaires pour les pièces ou la main-d''œuvre.', 'Durée de garantie', NULL, '24 Mois', '{"icon": "ShieldCheck"}'::jsonb, 2),
('garantie', 'figure-2', NULL, NULL, 'Notre équipe technique basée à Dakar intervient à domicile pour diagnostic et réparation.', 'Intervention locale', NULL, 'SAV Dakar', '{"icon": "Wrench"}'::jsonb, 3),
('garantie', 'figure-3', NULL, NULL, 'Réponse technique garantie en 48 à 72 heures ouvrables après ouverture du dossier.', 'Délai de traitement', NULL, '48–72h', '{"icon": "Clock"}'::jsonb, 4),
('garantie', 'covered', NULL, 'Ce qui est couvert', NULL, NULL, NULL, NULL, '{"items": ["Défaut de fabrication constaté dans les conditions normales d''utilisation", "Panne électronique ou mécanique non liée à une surtension ou mauvaise manipulation", "Remplacement des pièces défectueuses d''origine Continental®", "Main-d''œuvre technique incluse sur toute la période de garantie"]}'::jsonb, 5),
('garantie', 'not-covered', NULL, 'Ce qui n''est pas couvert', NULL, NULL, NULL, NULL, '{"items": ["Dommages causés par une surtension électrique ou mauvaise installation", "Casses ou chocs physiques constatés à la livraison sans signalement immédiat", "Modifications ou réparations effectuées par un technicien non agréé", "Usure normale des consommables (filtres, télécommandes, câbles)"]}'::jsonb, 6),
('garantie', 'step-1', NULL, 'Contactez notre SAV', 'Appelez ou envoyez un WhatsApp avec votre numéro de commande et la description du problème constaté.', NULL, NULL, '01', '{}'::jsonb, 7),
('garantie', 'step-2', NULL, 'Diagnostic à distance', 'Notre technicien vous guide pour vérifier l''origine du dysfonctionnement en 5 à 15 minutes.', NULL, NULL, '02', '{}'::jsonb, 8),
('garantie', 'step-3', NULL, 'Intervention ou échange', 'Selon le diagnostic, un technicien se déplace à Dakar ou procède à l''échange direct de l''appareil.', NULL, NULL, '03', '{}'::jsonb, 9),
('garantie', 'step-4', NULL, 'Clôture du dossier', 'Dossier traité en 48h à 72h ouvrables. Rapport d''intervention remis à la clôture.', NULL, NULL, '04', '{}'::jsonb, 10)
ON CONFLICT (slot, key) DO UPDATE SET
  eyebrow=EXCLUDED.eyebrow, title=EXCLUDED.title, body=EXCLUDED.body, meta=EXCLUDED.meta, icon=EXCLUDED.icon, num=EXCLUDED.num, data=EXCLUDED.data, position=EXCLUDED.position,
  updated_at=now();

INSERT INTO public.content_blocks (slot, key, eyebrow, title, body, meta, data, position) VALUES
('contact', 'hero', 'Nous contacter', 'Parlons de votre besoin.', NULL, NULL, '{"cta1": "Écrire sur WhatsApp"}'::jsonb, 0),
('contact', 'channel-1', NULL, 'WhatsApp', 'Réponse la plus rapide, en journée.', NULL, '{"icon": "MessageCircle"}'::jsonb, 1),
('contact', 'channel-2', NULL, 'Téléphone', 'Pour une question de garantie.', NULL, '{"icon": "Phone"}'::jsonb, 2),
('contact', 'channel-3', NULL, 'E-mail', 'Devis proforma et comptes entreprises.', NULL, '{"icon": "Mail"}'::jsonb, 3),
('contact', 'form-title', NULL, 'Une question précise ?', 'Décrivez votre besoin, nous revenons vers vous avec une réponse précise.', NULL, '{}'::jsonb, 4),
('contact', 'faq-title', 'Questions fréquentes', NULL, NULL, NULL, '{}'::jsonb, 5),
('contact', 'faq-1', NULL, 'Comment passer commande ?', 'Envoyez un message WhatsApp avec le modèle souhaité. Notre équipe confirme la disponibilité, organise la livraison et confirme le paiement.', NULL, '{}'::jsonb, 6),
('contact', 'faq-2', NULL, 'Quelle garantie sur les produits ?', 'Tous nos appareils bénéficient d''une garantie fabricant de 2 ans, pièces et main-d''œuvre incluses. Consultez la page Garantie pour les détails.', NULL, '{}'::jsonb, 7),
('contact', 'faq-3', NULL, 'Quels sont les modes de paiement ?', 'Wave, Orange Money, Free Money et espèces à la livraison. Devis proforma disponible pour les entreprises sur demande.', NULL, '{}'::jsonb, 8),
('contact', 'faq-4', NULL, 'Livrez-vous en dehors de Dakar ?', 'Actuellement, notre service de livraison couvre la région de Dakar et sa banlieue immédiate. Contactez-nous pour les cas particuliers.', NULL, '{}'::jsonb, 9),
('contact', 'faq-5', NULL, 'La climatisation inclut-elle l''installation ?', 'L''installation par notre technicien agréé est disponible en option. Demandez un devis installation lors de votre commande.', NULL, '{}'::jsonb, 10)
ON CONFLICT (slot, key) DO UPDATE SET
  eyebrow=EXCLUDED.eyebrow, title=EXCLUDED.title, body=EXCLUDED.body, meta=EXCLUDED.meta, data=EXCLUDED.data, position=EXCLUDED.position,
  updated_at=now();
-- =============================================================================
