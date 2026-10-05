import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { buildWhatsAppUrl, buildOrderMessage } from '@/lib/whatsapp'
import { getBlock, getSlotProduct, getSiteProducts } from '@/lib/atelier'

/**
 * « Notre plus vendu » — le produit occupant la place `bestseller`.
 *
 * Ce que cette section n'est PLUS
 * -------------------------------
 * Elle affichait auparavant une fiche entièrement écrite à la main dans ce
 * fichier : un climatiseur « 12000 BTU Tropicalisé » à 195 000 FCFA, avec
 * quatre arguments de vente (« 21 dB », « Revêtement Gold Fin »…) et un visuel
 * de `public/products/`. Aucun de ces produits n'existe en base.
 *
 * Le bloc de contenu ne pouvait qu designations : il pointait sur un slug
 * absent de la base, la recherche échouait, et le composant retombait sur la
 * fiche factice — avec son prix. C'est ainsi qu'un prix de 195 000 FCFA,
 * écrit en dur dans le dépôt, s'est affiché alors que le produit réel est à
 * 30 000.
 *
 * Ce qu'elle est maintenant
 * -------------------------
 * Une lecture de la place `bestseller`. La base garantit qu'une seule ligne la
 * porte : il n'existe plus de produit de remplacement oublié quelque part. Le
 * nom, la référence, le prix, les caractéristiques et la photo viennent tous
 * de la fiche réelle. Si la place est libre, on affiche le premier produit
 * publié — un article vrai, mal mis en avant, vaut mieux qu'une invention.
 *
 * Les seules valeurs locales restantes sont les LIBELLÉS d'interface
 * (« Notre plus vendu », « Garantie 2 ans »), pas du contenu commercial.
 */

export default async function BestsellerSection() {
  const block = await getBlock('bestseller', 'bestseller')

  const slot = await getSlotProduct('bestseller')
  const products = await getSiteProducts()

  // Repli : la place est libre. On prend alors le premier produit publié,
  // plutôt que d'inventer une fiche.
  const chosen = slot?.product ?? products.products[0]
  const badge = slot?.label ?? String(block?.data.badge ?? '')

  if (!chosen) return null

  const waUrl = buildWhatsAppUrl(
    buildOrderMessage({ productName: chosen.name, ref: chosen.ref }),
  )

  const eyebrow = block?.eyebrow ?? 'Notre plus vendu'
  // Le titre du bloc ne remplace PLUS le nom du produit : il indiquait
  // « 12000 BTU Tropicalisé » pour un article de 12 000 BTU qui n'a jamais
  // existé. Le nom vient de la fiche, sans exception.
  const features = chosen.features.filter(Boolean).slice(0, 4)
  const priceLabel = new Intl.NumberFormat('fr-FR').format(chosen.price).replace(/ /g, ' ') + ' FCFA'

  return (
    <section className="bg-bg-secondary py-20 sm:py-28">
      <div className="container-site">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16 lg:items-center">

          {/* Produit sur surface grise — le visuel est le héros */}
          <div className="lg:col-span-7">
            <div className="stage relative aspect-[4/3] w-full">
              {chosen.image ? (
                <Image
                  src={chosen.image}
                  alt={chosen.name}
                  fill
                  className="object-contain p-12 sm:p-16"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
              ) : (
                /* Même garde-fou que sur les tuiles : `next/image` lève sur une
                   chaîne vide et ferait tomber la page d'accueil entière. */
                <span className="flex h-full w-full items-center justify-center text-sm text-text-muted">
                  Photo à venir
                </span>
              )}
              {badge && (
                <span className="absolute left-6 top-6 rounded-full bg-text-primary px-4 py-1.5 text-xs font-semibold text-white">
                  {badge}
                </span>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <p className="eyebrow">{eyebrow}</p>

            <h2 className="display-lg mt-4 text-text-primary" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}>
              {chosen.name}
            </h2>

            <p className="mt-3 text-sm text-text-muted">
              {chosen.ref ? `Réf. ${chosen.ref} · ` : ''}Garantie 2 ans
            </p>

            {chosen.shortDesc && (
              <p className="mt-5 text-sm leading-relaxed text-text-body">{chosen.shortDesc}</p>
            )}

            {features.length > 0 && (
              <ul className="mt-8 space-y-3.5">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm leading-relaxed text-text-body">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            )}

            <div className="hairline mt-9 pt-8">
              <span className="product-ref text-text-muted">Prix Continental® Dakar</span>
              <p className="display-md mt-1 text-3xl text-text-primary">
                {priceLabel.split(' FCFA')[0]}{' '}
                <span className="text-lg font-medium text-text-muted">FCFA</span>
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-accent">
                  <MessageCircle size={17} />
                  Commander
                </a>
                <Link href={`/produit/${chosen.slug}`} className="btn-outline">
                  Fiche complète
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}