/**
 * products.ts — Catalogue complet Continental®
 * Tous les produits utilisent désormais les photos de produits isolées sur fond blanc (Stock-Images/Products).
 */

/**
 * Catégorie d'un produit.
 *
 * Ce type était une union fermée de trois valeurs : `ventilateur-pied`,
 * `ventilateur-sol`, `climatiseur`. C'était faux depuis le passage des produits
 * en base. Les catégories vivent dans la table `categories` et le vendeur peut
 * en créer une — c'est ainsi qu'une gamme « Téléviseurs » est apparue. Une
 * union fermée ne peut pas accueillir une catégorie qu'elle ne connaissait pas
 * à la compilation : elle poussait à écrire une fonction de conversion, et
 * cette fonction est précisément ce qui faisait perdre l'information.
 *
 * On garde les trois valeurs historiques pour les données locales du dépôt,
 * mais le type n'impose plus une liste : `string` autorise n'importe quel slug
 *issu de la base, et `Category` reste un alias lisible pour le reste du code.
 */
export type Category =
  | 'ventilateur-pied' | 'ventilateur-sol' | 'climatiseur'
  | (string & {})

export interface Product {
  id: string
  slug: string
  name: string
  ref: string
  category: Category
  categoryLabel: string
  price: number          // FCFA
  image: string          // chemin depuis /public/products
  images: string[]       // galerie fiche produit
  features: string[]     // caractéristiques techniques réelles
  specs: Record<string, string>  // tableau technique
  badge?: string
  inStock: boolean
  isBestseller?: boolean
  /**
   * Accroche sous le titre, et texte long sous les caractéristiques.
   *
   * Les deux champs étaient bien réels en base et remplis dans
   * l'administration, mais absents de ce type comme du mapping Supabase : la
   * fiche produit n'affichait ni l'un ni l'autre.
   */
  shortDesc?: string
  description?: string

  /**
   * Badges actifs sur ce produit, tels que limités par la table
   * `product_badges` (une seule place pour « héros » et « Best-seller »).
   *
   * Distinct de `badge` ci-dessus : celui-ci est une étiquette libre collée
   * sur la fiche, tandis que `badges` est une RUBRIQUE. « Télécommande »
   * décrit le produit ; « Best-seller » dit qu'il occupe la place du
   * meilleur-vendu sur la page d'accueil. Les deux cohabitent.
   */
  badges?: ProductBadge[]

  /**
   * Modèles déclinés d'une même fiche (colonne `products.variants`).
   *
   * Le split mural existe en trois puissances ; elles partagent la même fiche,
   * la même photo et la même description. Sans ce champ il fallait trois
   * fiches — trois cartes dans le catalogue et trois adresses à diffuser pour
   * un seul appareil, et le visiteur qui cherchait « le 2 cv » devait deviner
   * laquelle ouvrir.
   */
  variants?: ProductVariant[]
}

/**
 * Un modèle décliné d'une fiche.
 *
 * `id` est stable et sert de clé de sélection ; `label` est ce que le visiteur
 * lit et clique (« 1,5 cv — 12000 BTU »). `price` est le prix de CE modèle :
 * la fiche affiche le prix de la variante choisie, jamais celui de l'entrée de
 * base — sinon le sélecteur mentirait sur ce qu'il fait.
 */
export interface ProductVariant {
  id: string
  label: string
  price: number
  /** « 1,5 cv » — repris tel quel dans le récapitulatif. */
  power?: string
  /** 12000 — en chiffre, pour un tri ou un filtre éventuel. */
  btu?: number

  /**
   * Fiche technique PROPRE au modèle : { "Modèle": "CT-INV-09 A+++", … }.
   *
   * Affichée sous le sélecteur, fusionnée avec les caractéristiques communes
   * de la fiche. C'est ce qui manquait pour vendre : les trois puissances
   * partagent la technologique inverter et le montage mural, mais chacune a
   * ses poids, ses dimensions, son code produit et son code-barres. Ce sont
   * ces valeurs-là que le vendeur lit sur le carton.
   */
  specs?: Record<string, string>

  /**
   * Avertissement de manutention propre au colis de ce modèle.
   *
   * Renseigné pour le 1,5 cv, dont le carton demande deux personnes. C'est une
   * consigne de sécurité : elle s'affiche en clair sous la fiche, jamais
   * noyée dans le tableau technique où personne ne la lirait.
   */
  warning?: string
}

/** Une rubrique de mise en avant, avec la place qu'elle occupe. */
export interface ProductBadge {
  /** `hero`, `bestseller`, `promo`, `nouveau` ou `stock_limite`. */
  slot: string
  /** Texte affiché sur la pastille : « Best-seller », « Promotion »… */
  label: string
}

export const products: Product[] = [
  {
    id: '1',
    slug: 'ventilateur-pied-fs4011',
    name: 'Ventilateur sur Pied 16" avec Télécommande',
    ref: 'FS4011-PRO',
    category: 'ventilateur-pied',
    categoryLabel: 'Ventilateur sur pied',
    price: 30000,
    image: '/products/ventilateur-pied-fs4011.jpg',
    images: ['/products/ventilateur-pied-fs4011.jpg'],
    features: [
      'Moteur 100% cuivre haute endurance',
      'Télécommande de contrôle à distance',
      '3 vitesses de flux d\'air avec minuterie',
      'Oscillation grand angle 90° et hauteur ajustable',
      'Conception ultra-silencieuse pour chambre et salon',
    ],
    specs: {
      Diamètre: '16 pouces (40 cm)',
      Alimentation: '220V - 240V / 50Hz',
      Puissance: '55W',
      Moteur: '100% Cuivre bobiné',
      Contrôle: 'Télécommande + Panneau tactile',
      Garantie: '2 ans Continental®',
    },
    badge: 'Best-Seller',
    inStock: true,
    isBestseller: true,
  },
  {
    id: '2',
    slug: 'ventilateur-sol-louisiane-45cm',
    name: 'Ventilateur Brasseur d\'Air Sol Métal 45cm',
    ref: 'VBR-45M',
    category: 'ventilateur-sol',
    categoryLabel: 'Ventilateur de sol',
    price: 30000,
    image: '/products/ventilateur-sol-louisiane-45cm.jpg',
    images: ['/products/ventilateur-sol-louisiane-45cm.jpg'],
    features: [
      'Structure métallique chromée ultra-robuste',
      '3 vitesses de ventilation à grand débit d\'air',
      'Inclinaison verticale orientable à 120°',
      'Pieds stables avec patins anti-vibrations',
      'Idéal grands volumes, ateliers, bureaux et salons',
    ],
    specs: {
      Diamètre: '45 cm (18")',
      Puissance: '70W haute performance',
      Matériau: 'Acier chromé + Pales aérodynamiques',
      Débit: 'Brasseur d\'air gros volume',
      Garantie: '2 ans Continental®',
    },
    badge: 'Pro Métal',
    inStock: true,
  },
  {
    id: '3',
    slug: 'ventilateur-industriel-vm56',
    name: 'Ventilateur Industriel sur Pied Puissance Max',
    ref: 'VM-56PI',
    category: 'ventilateur-pied',
    categoryLabel: 'Ventilateur sur pied',
    price: 30000,
    image: '/products/ventilateur-industriel-vm56.jpg',
    images: ['/products/ventilateur-industriel-vm56.jpg'],
    features: [
      'Pales industrielles profilées gros flux',
      'Piètement lourd en croix pour une stabilité maximale',
      'Moteur haute intensité renforcé anti-surchauffe',
      'Oscillation automatique débrayable',
      'Conçu pour résister aux environnements chauds',
    ],
    specs: {
      Diamètre: '50 cm (20")',
      Alimentation: '230V / 50Hz',
      Puissance: '120W Industriel',
      Structure: 'Acier renforcé noir mat',
      Garantie: '2 ans Continental®',
    },
    badge: 'Haute Puissance',
    inStock: true,
  },
  {
    id: '4',
    slug: 'climatiseur-split-pro-inverter',
    name: 'Climatiseur Split Inverter 12000 BTU',
    ref: 'CT-12INV-PRO',
    category: 'climatiseur',
    categoryLabel: 'Climatiseur split',
    price: 195000,
    image: '/products/climatiseur-split-pro-inverter.jpg',
    images: ['/products/climatiseur-split-pro-inverter.jpg'],
    features: [
      'Technologie Inverter : jusqu\'à 60% d\'économie d\'énergie',
      'Refroidissement ultra-rapide spécial climat sahélien',
      'Filtre antibactérien et purification d\'air',
      'Fonctionnement silencieux nocturne (21 dB)',
      'Gaz écologique R410A / R32 haute performance',
    ],
    specs: {
      Capacité: '12 000 BTU (1.5 CV)',
      Technologie: 'Digital Inverter Tropicalisé',
      Classe: 'A+++ Énergie',
      'Niveau sonore': '21 dB (Mode Silence)',
      Garantie: '2 ans compresseur & pièces',
    },
    badge: 'Inverter Eco',
    inStock: true,
    isBestseller: true,
  },
  {
    id: '5',
    slug: 'climatiseur-eco-inverter-gree',
    name: 'Climatiseur Split Silencieux 9000 BTU',
    ref: 'CT-09ECO',
    category: 'climatiseur',
    categoryLabel: 'Climatiseur split',
    price: 165000,
    image: '/products/climatiseur-eco-inverter-gree.jpg',
    images: ['/products/climatiseur-eco-inverter-gree.jpg'],
    features: [
      'Idéal pour chambres à coucher et petits espaces (15-25 m²)',
      'Télécommande intelligente avec capteur de température I-Feel',
      'Affichage LED masqué sur façade design',
      'Traitement anti-corrosion Gold Fin pour bord de mer (Dakar)',
      'Redémarrage automatique après coupure de courant',
    ],
    specs: {
      Capacité: '9 000 BTU (1 CV)',
      Voltage: '220V - 240V',
      Revêtement: 'Anti-corrosion Gold Fin',
      Télécommande: 'LCD rétroéclairée incluse',
      Garantie: '2 ans Continental®',
    },
    badge: 'Chambre Zen',
    inStock: true,
  },
  {
    id: '6',
    slug: 'climatiseur-multi-split-18000btu',
    name: 'Climatiseur Split Grand Salon 18000 BTU',
    ref: 'CT-18PWR',
    category: 'climatiseur',
    categoryLabel: 'Climatiseur split',
    price: 245000,
    image: '/products/climatiseur-multi-split-18000btu.webp',
    images: ['/products/climatiseur-multi-split-18000btu.webp'],
    features: [
      'Gros débit de froid conçu pour les grands salons et espaces commerciaux',
      'Flux d\'air 4D multidirectionnel automatique',
      'Compresseur tropicalisé résistant jusqu\'à 55°C extérieur',
      'Mode Turbo Rafraîchissement express en 30 secondes',
      'Télécommande ergonomique complète avec programmation 24h',
    ],
    specs: {
      Capacité: '18 000 BTU (2 CV)',
      Compresseur: 'Tropicalisé T3 (Jusqu\'à 55°C)',
      Alimentation: '220-240V / 50Hz',
      'Surface conseillée': '35 à 55 m²',
      Garantie: '2 ans Continental®',
    },
    badge: 'Grand Salon',
    inStock: true,
  },
]

export const categories = [
  { id: 'all', label: 'Tous les produits' },
  { id: 'ventilateur-pied', label: 'Ventilateurs sur pied' },
  { id: 'ventilateur-sol', label: 'Brasseurs d\'air & Sol' },
  { id: 'climatiseur', label: 'Climatiseurs Inverter' },
] as const

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getProductsByCategory(categoryId: string): Product[] {
  if (categoryId === 'all') return products
  return products.filter((p) => p.category === categoryId)
}

export function getRelatedProducts(product: Product, limit = 3): Product[] {
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit)
}
