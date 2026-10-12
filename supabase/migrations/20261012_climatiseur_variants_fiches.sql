-- Fiches techniques des trois modèles du split mural inverter.
--
-- Les trois puissances partagent la technologie inverter et le montage mural,
-- mais chacune a ses propres poids, dimensions, code produit et code-barres.
-- Ces valeurs viennent de la fiche fabricant communiquée par le commettant ;
-- aucune n'est déduite ni complétée.
--
-- Elles vivent dans la variante, pas dans `specs` : ce sont elles qui changent
-- quand le visiteur bascule de modèle. `specs` ne porte plus que le commun.
--
-- « Classe énergétique » passe de A+ à A+++ : la fiche, le nom du produit et
-- les trois codes modèle disent A+++. La valeur précédente contredisait les
-- trois autres endroits où la même information est écrite.

UPDATE products
SET
  specs = '{
    "Type": "Split mural",
    "Montage": "Mural",
    "Technologie": "Inverter",
    "Classe énergétique": "A+++"
  }'::jsonb,
  variants = $json$
[
  {
    "id": "9000",
    "label": "1 cv — 9000 BTU",
    "power": "1 cv",
    "btu": 9000,
    "price": 150000,
    "specs": {
      "Modèle": "CT-INV-09 A+++",
      "Puissance": "9000 Btu/h",
      "Tension": "220-240 V~",
      "Fréquence": "50 Hz",
      "Coloris": "Blanc",
      "Poids brut / net": "7,9 / 6,4 kg",
      "Dimensions": "786 × 264 × 320 mm",
      "Code produit": "2001900669",
      "Code-barres": "G3090503130066960112003H",
      "Marquage colis": "This side up, handle with care, keep dry, stack limit 8"
    }
  },
  {
    "id": "12000",
    "label": "1,5 cv — 12000 BTU",
    "power": "1,5 cv",
    "btu": 12000,
    "price": 180000,
    "specs": {
      "Modèle": "CT-INV-12 A+++",
      "Puissance": "12000 Btu/h",
      "Tension": "220-240 V~",
      "Fréquence": "50 Hz",
      "Coloris": "Gris clair",
      "Poids brut / net": "23 / 19,5 kg",
      "Dimensions": "768 × 581 × 338 mm",
      "Code produit": "2001900696",
      "Code-barres": "G3690505460069660112000M",
      "Marquage colis": "This side up, handle with care, keep dry, stack limit 8"
    },
    "warning": "Risque de blessure. Deux personnes au minimum sont nécessaires pour lever ou déplacer ce climatiseur. Utilisez une procédure de levage adaptée."
  },
  {
    "id": "18000",
    "label": "2 cv — 18000 BTU",
    "power": "2 cv",
    "btu": 18000,
    "price": 210000,
    "specs": {
      "Modèle": "CT-INV-18 A+++",
      "Puissance": "18000 Btu/h",
      "Tension": "220-240 V~",
      "Fréquence": "50 Hz",
      "Coloris": "Blanc",
      "Poids brut / net": "12,7 / 10,3 kg",
      "Dimensions": "1008 × 300 × 351 mm",
      "Code produit": "2001900703",
      "Code-barres": "G30905053700703601120005",
      "Marquage colis": "This side up, handle with care, keep dry, stack limit 8"
    }
  }
]
$json$::jsonb
WHERE slug = 'climatiseur-split-inverter';
