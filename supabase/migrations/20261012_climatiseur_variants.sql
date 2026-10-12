-- Variantes de modèle : trois puissances sous une seule fiche produit.
--
-- Jusqu'ici le catalogue ne savait représenter qu'une puissance par fiche. Les
-- trois modèles du split mural inverter auraient donc donné trois cartes, trois
-- références et trois adresses pour un seul appareil — et le visiteur qui
-- cherchait « le 2 cv » devait deviner laquelle ouvrir.
--
-- La colonne porte la liste des modèles ; l'entrée de base reste l'entrée
-- publique, et son prix (150 000) est celui du premier modèle, le 1 cv.
--
-- Aucune valeur n'est inventée ici : seules les puissances et les prix
-- communiqués par le commettant y figurent. Les dimensions, poids, codes
-- modèle et coloris restent à fournir pour compléter chaque variante.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS variants jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN products.variants IS
  'Modèles déclinés d''une même fiche : [{id,label,power,btu,price}]. Vide = fiche à modèle unique.';

UPDATE products
SET variants = '[
  {"id": "9000",  "label": "1 cv — 9000 BTU",   "power": "1 cv",   "btu": 9000,  "price": 150000},
  {"id": "12000", "label": "1,5 cv — 12000 BTU", "power": "1,5 cv", "btu": 12000, "price": 180000},
  {"id": "18000", "label": "2 cv — 18000 BTU",   "power": "2 cv",   "btu": 18000, "price": 210000}
]'::jsonb
-- Le nom portait « 1cv » : il désigne maintenant les trois puissances.
, name = 'Climatiseur Split Mural Inverter'
WHERE slug = 'climatiseur-split-inverter';
