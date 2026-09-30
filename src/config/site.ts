/**
 * site.ts — Source unique de vérité — Continental®
 * Toutes les données visibles sur le site viennent d'ici.
 */

export const siteConfig = {
  name: 'Continental®',
  tagline: "L'air de la performance.",
  description:
    'Ventilateurs sur pied, muraux et climatiseurs Continental® — qualité certifiée, garantie 2 ans. Livraison à Dakar et banlieue.',
  url: 'https://continental-dakar.com',

  contact: {
    phone: '+221 77 000 00 00',
    whatsapp: '221770000000',
    email: '',
    address: '',
    neighborhood: '',
    city: 'Dakar',
    country: 'Sénégal',
  },

  social: {
    facebook: '',
    instagram: '',
    tiktok: '',
  },

  hours: {
    weekdays: '8h – 20h',
    saturday: '9h – 18h',
    sunday: 'Fermé',
  },

  payments: {
    wave: true,
    orangeMoney: true,
    freeMoney: true,
    cash: true,
  },

  delivery: {
    available: true,
    zones: [
      { name: 'Dakar Plateau', delay: '24h', fee: 0 },
      { name: 'Médina / Gueule Tapée', delay: '24h', fee: 0 },
      { name: 'Parcelles Assainies', delay: '24–48h', fee: 1500 },
      { name: 'Guédiawaye', delay: '24–48h', fee: 2000 },
      { name: 'Pikine', delay: '48h', fee: 2000 },
      { name: 'Rufisque', delay: '48–72h', fee: 3500 },
    ],
    freeFrom: 50000,
  },

  seo: {
    keywords: [
      'ventilateur sur pied Dakar',
      'ventilateur mural Dakar',
      'climatiseur Dakar',
      'Continental ventilateur prix',
      'acheter ventilateur Continental Sénégal',
      'ventilateur télécommande Dakar',
    ],
    ogImage: '/og-image.jpg',
    twitterHandle: '',
  },
}

export type SiteConfig = typeof siteConfig
