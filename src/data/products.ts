/**
 * products.ts — Catalogue complet Continental®
 * Source de vérité pour tous les produits. Modifier ici = mis à jour partout.
 */

export type Category = 'ventilateur-pied' | 'ventilateur-mural' | 'ventilateur-plafond' | 'climatiseur'

export interface Product {
  id: string
  slug: string
  name: string
  ref: string
  category: Category
  categoryLabel: string
  price: number          // FCFA — placeholder 30000
  image: string          // chemin depuis /public
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
    slug: 'stand-fan-fs40-1688',
    name: 'Ventilateur sur Pied 16"',
    ref: 'FS40-1688',
    category: 'ventilateur-pied',
    categoryLabel: 'Ventilateur sur pied',
    price: 30000,
    image: '/products/stand-fan-fs40-1688.jpg',
    images: ['/products/stand-fan-fs40-1688.jpg'],
    features: [
      '3 vitesses de fonctionnement',
      'Minuterie 1 heure',
      'Design moderne et attractif',
      'Oscillation et inclinaison de la tête',
      'Fonctionnement très silencieux',
      'Hauteur ajustable',
    ],
    specs: {
      Taille: '16" (400mm)',
      Voltage: 'AC 230V~',
      Fréquence: '50Hz',
      Puissance: '50W',
      Dimensions: '560 × 180 × 540 mm',
      Poids: '11 KGS',
    },
    inStock: true,
  },
  {
    id: '2',
    slug: 'orbit-fan-fb-40a',
    name: 'Ventilateur Orbital 16"',
    ref: 'FB-40A',
    category: 'ventilateur-plafond',
    categoryLabel: 'Ventilateur orbital',
    price: 30000,
    image: '/products/orbit-fan-fb-40a.jpg',
    images: ['/products/orbit-fan-fb-40a.jpg'],
    features: [
      '3 vitesses avec contrôleur',
      'Rotation 360° grand angle',
      'Montage au plafond',
      'Télécommande incluse',
    ],
    specs: {
      Modèle: 'FB-40A',
      Type: 'Orbital plafond',
      Voltage: 'AC 230V~',
      Rotation: '360°',
    },
    inStock: true,
  },
  {
    id: '3',
    slug: 'wall-fan-fb-40rc',
    name: 'Ventilateur Mural 16" Télécommande',
    ref: 'FB-40RC(1)',
    category: 'ventilateur-mural',
    categoryLabel: 'Ventilateur mural',
    price: 30000,
    image: '/products/wall-fan-fb-40rc.jpg',
    images: ['/products/wall-fan-fb-40rc.jpg'],
    features: [
      '5 pales AS haute performance',
      'Moteur 100% cuivre',
      'Oscillation gauche / droite',
      'Faible bruit, fort débit d\'air',
      '3 vitesses avec télécommande',
    ],
    specs: {
      Modèle: 'FB-40RC(1)',
      Pales: '5 pcs AS',
      Moteur: '100% cuivre',
      Voltage: 'AC 230V~',
    },
    badge: 'Télécommande',
    inStock: true,
    isBestseller: true,
  },
  {
    id: '4',
    slug: 'wall-fan-fw45-810r',
    name: 'Ventilateur Mural 18" Télécommande',
    ref: 'FW45-810R',
    category: 'ventilateur-mural',
    categoryLabel: 'Ventilateur mural',
    price: 30000,
    image: '/products/wall-fan-fw45-810r.jpg',
    images: ['/products/wall-fan-fw45-810r.jpg'],
    features: [
      '3 vitesses de fonctionnement',
      'Minuterie 1 heure',
      'Design moderne et attractif',
      'Oscillation et inclinaison de la tête',
      'Fonctionnement très silencieux',
      'Télécommande incluse',
    ],
    specs: {
      Taille: '18" (450mm)',
      Voltage: 'AC 230V~',
      Fréquence: '50Hz',
      Puissance: '85W',
      Dimensions: '510 × 240 × 510 mm',
      Poids: '6.5 KGS',
    },
    inStock: true,
  },
  {
    id: '5',
    slug: 'stand-fan-fs40-408',
    name: 'Ventilateur sur Pied 16" Premium',
    ref: 'FS40-408',
    category: 'ventilateur-pied',
    categoryLabel: 'Ventilateur sur pied',
    price: 30000,
    image: '/products/stand-fan-fs40-408.jpg',
    images: ['/products/stand-fan-fs40-408.jpg'],
    features: [
      'Moteur 100% cuivre',
      '3 vitesses de fonctionnement',
      'Minuterie 60 minutes',
      'Design attractif et moderne',
      'Oscillation et inclinaison de la tête',
      'Fonctionnement très silencieux',
      'Hauteur ajustable',
    ],
    specs: {
      Taille: '16" (400mm)',
      Moteur: '100% cuivre',
      Minuterie: '60 min',
      Vitesses: '3',
      Voltage: 'AC 230V~',
    },
    badge: 'Nouveau',
    inStock: true,
  },
  {
    id: '6',
    slug: 'stand-fan-fs40-1891r',
    name: 'Ventilateur sur Pied 16" Elite',
    ref: 'FS40-1891R',
    category: 'ventilateur-pied',
    categoryLabel: 'Ventilateur sur pied',
    price: 30000,
    image: '/products/stand-fan-fs40-1891r.jpg',
    images: ['/products/stand-fan-fs40-1891r.jpg'],
    features: [
      'Élégance et fraîcheur',
      '3 vitesses de fonctionnement',
      'Minuterie 7.5 heures',
      'Inclinaison et oscillation de la tête',
      'Fonctionnement très silencieux',
      'Hauteur ajustable',
      'Télécommande de précision',
    ],
    specs: {
      Modèle: 'FS40-1891R',
      Taille: '16" (400mm)',
      Minuterie: '7.5 heures',
      Vitesses: '3',
      Télécommande: 'Incluse',
    },
    badge: 'Best-seller',
    inStock: true,
    isBestseller: true,
  },
  {
    id: '7',
    slug: 'stand-fan-5-308r',
    name: 'Ventilateur sur Pied 18" Pro',
    ref: '5-308R',
    category: 'ventilateur-pied',
    categoryLabel: 'Ventilateur sur pied',
    price: 30000,
    image: '/products/stand-fan-5-308r.jpg',
    images: ['/products/stand-fan-5-308r.jpg'],
    features: [
      'Moteur haute performance',
      '8 vitesses de fonctionnement',
      'Minuterie 8 heures',
      'Télécommande de précision',
      'Oscillation grand angle',
      'Hauteur réglable',
      'Fonctionnement silencieux',
    ],
    specs: {
      Taille: '18" (450mm)',
      Vitesses: '8',
      Minuterie: '8 heures',
      Télécommande: 'Incluse',
      Garantie: '2 ans',
    },
    badge: 'Haut de gamme',
    inStock: true,
  },
]

export const categories = [
  { id: 'all', label: 'Tous les produits' },
  { id: 'ventilateur-pied', label: 'Ventilateurs sur pied' },
  { id: 'ventilateur-mural', label: 'Ventilateurs muraux' },
  { id: 'ventilateur-plafond', label: 'Ventilateurs orbitaux' },
  { id: 'climatiseur', label: 'Climatiseurs' },
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
