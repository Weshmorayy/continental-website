/**
 * products.ts — Catalogue complet Continental®
 * Tous les produits utilisent désormais les photos de produits isolées sur fond blanc (Stock-Images/Products).
 */

export type Category = 'ventilateur-pied' | 'ventilateur-sol' | 'climatiseur'

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
      Niveau sonore: '21 dB (Mode Silence)',
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
      Surface conseillée: '35 à 55 m²',
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
