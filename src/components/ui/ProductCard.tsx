'use client'

/**
 * ProductCard — tuile du catalogue.
 *
 * C'est un composant CLIENT depuis que la tuille affiche un bouton « Ajouter au
 * panier » : l'action se produit dans le navigateur, elle ne peut pas se
 * demander au serveur. Il lit aussi les réglages résolus dans le contexte pour
 * ouvrir la conversation WhatsApp au bon numéro — un composant serveur ne peut
 * pas appeler `useStore()`.
 */
import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, ShieldCheck } from 'lucide-react'
import type { Product } from '@/data/products'
import { buildWhatsAppUrl, buildOrderMessage } from '@/lib/whatsapp'
import AddToCart from '@/components/cart/AddToCart'
import { useStore } from '@/context/StoreContext'

interface ProductCardProps {
  product: Product
  size?: 'default' | 'large'
}

/**
 * Tuile produit — surface grise SANS bordure, image en grand,
 * titre gras dessous. Aligné sur les cartes samsung.com.
 *
 * Les visuels produits ont été détourés sur fond transparent :
 * sur une surface grise, une photo à fond blanc laisserait
 * apparaître un rectangle blanc.
 */
export default function ProductCard({ product, size = 'default' }: ProductCardProps) {
  // Numéro de WhatsApp issu des RÉGLAGES : chaque tuile du catalogue doit
  // ouvrir la conversation vers le numéro actuel, pas vers celui du dépôt.
  const { siteConfig: cfg } = useStore()
  const waUrl = buildWhatsAppUrl(
    buildOrderMessage({ productName: product.name, ref: product.ref }),
    cfg,
  )

  /*
   * Deux origines pour une pastille, et une seule pastille à l'écran.
   *
   * `product.badges` vient des RUBRIQUES à places limitées (promotion,
   * best-seller, nouveau) : c'est une mise en avant éditoriale, elle change
   * quand l'administration change de place. `product.badge` est l'étiquette
   * collée à la fiche (« Télécommande », « Smart TV ») : elle décrit
   * l'appareil et ne bouge jamais.
   *
   * Les deux cohabitent, mais pas sur la même vignette : deux pastilles se
   * disputeraient la ligne. La rubrique l'emporte, parce que c'est elle qui
   * décide de l'achat — « -15 % » dit plus qu'« Inverter A+ ».
   */
  const rubriques = product.badges ?? []
  const pill = rubriques[0]?.label ?? product.badge

  return (
    <article className="card-product group flex flex-col">

      {/* Image — le produit est le héros */}
      <div className="relative">
        {pill && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-text-primary px-3 py-1 text-[11px] font-semibold text-white">
            {pill}
          </span>
        )}

        <Link
          href={`/produit/${product.slug}`}
          className={`block relative w-full ${size === 'large' ? 'h-72 sm:h-80' : 'h-64 sm:h-72'} p-8`}
          aria-label={product.name}
        >
          {product.image ? (
            <Image
              src={product.image}
              alt={`${product.name} (${product.ref})`}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 30vw"
            />
          ) : (
            /* `next/image` lève sur une chaîne vide : un produit sans photo
               ferait tomber la tuile entière, et avec elle la page catalogue.
               Un produit réel peut attendre sa photo ; une page cassée, non. */
            <span className="flex h-full w-full items-center justify-center text-xs text-text-muted">
              Photo à venir
            </span>
          )}
        </Link>
      </div>

      {/* Texte sous la tuile */}
      <div className="flex flex-col flex-1 px-6 pb-6">
        <p className="product-ref text-text-muted">{product.categoryLabel}</p>

        <Link href={`/produit/${product.slug}`} className="block mt-1.5">
          <h3 className="display-sm text-lg text-text-primary group-hover:underline">
            {product.name}
          </h3>
        </Link>

        {/*
         * La description COURTE vit ici, sur la carte — c'est sa place.
         *
         * Elle répond à la question que se pose le visiteur AVANT d'ouvrir la
         * fiche : « ce que c'est, en une ligne ». La longue n'a pas sa place
         * dans une vignette : à deux lignes de plus, elle tronque n'importe
         * comment et donne l'impression d'un texte coupé.
         *
         * `features[0]` reste le repli : sur une fiche alimentée avant
         * l'existence des deux champs, c'est la seule accroche disponible.
         */}
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-text-muted">
          {product.shortDesc || product.features[0]}
        </p>

        <div className="mt-auto pt-6">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs text-text-muted">Prix indicatif</span>
            <span className="price-tag">
              {product.price.toLocaleString('fr-FR')}{' '}
              <span className="text-sm font-medium text-text-muted">FCFA</span>
            </span>
          </div>

          <div className="flex items-center gap-2 mt-4">
            {/* Le panier est l'action par DÉFAUT : c'est elle qui enregistre
                la commande. WhatsApp reste proposée à côté — c'est le canal par
                lequel la vente se conclut réellement aujourd'hui, et certains
                clients ne.commandent que là.
                Inverser les deux, ou remplacer l'un par l'autre, ferait perdre
                des ventes dans les deux sens. */}
            <AddToCart
              slug={product.slug}
              name={product.name}
              modelRef={product.ref}
              price={product.price}
              image={product.image}
            />
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wa px-4 py-2.5 text-xs flex-shrink-0"
              aria-label={`Commander ${product.name} sur WhatsApp`}
            >
              <MessageCircle size={15} />
              <span className="sr-only sm:not-sr-only">WhatsApp</span>
            </a>
            <Link
              href={`/produit/${product.slug}`}
              className="btn-outline px-5 py-2.5 text-xs flex-shrink-0"
            >
              Détails
            </Link>
          </div>

          <p className="mt-4 flex items-center gap-1.5 text-[11px] text-text-muted">
            <ShieldCheck size={13} className="text-accent flex-shrink-0" />
            Garantie fabricant 2 ans
          </p>
        </div>
      </div>
    </article>
  )
}
