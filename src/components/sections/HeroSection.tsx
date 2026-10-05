import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { getBlock, getSlotProduct } from '@/lib/atelier'

/**
 * Héros — structure calquée sur samsung.com : colonne unique
 * CENTRÉE sur fond gris clair, sur-surtitre d'accent, titre très
 * gras, sous-titre, une seule action, puis le produit en grand
 * format en dessous.
 *
 * La version précédente était un split deux colonnes (texte à
 * gauche, image à droite) — c'est précisément ce qui ne
 * ressemblait pas à Samsung.
 *
 * ── Le produit du héros ───────────────────────────────────────────────────
 * Il vient de la place `hero`, c'est-à-dire d'une ligne de
 * `product_badges`. Auparavant, le visuel était un fichier de `public/products/`
 * — `ventilateur-pied-fs4011.jpg` — qui ne correspond à aucun produit en base,
 * et la légende dessous affichait un prix écrit en dur (« 30.000 FCFA »).
 * Deux endroits à tenir à jour à la main, et un visuel qui ne se vend pas.
 *
 * L'image, le nom et le prix viennent maintenant de la fiche désignée par la
 * place. Le prix affiché est celui de la fiche : s'il change dans
 * l'administration, le héros change avec, sans réédition de code.
 *
 * Le titre et le sous-titre, eux, restent pilotés par le bloc « hero » : ce sont
 * des textes de marque, pas des données produit.
 */

export default async function HeroSection() {

  const hero = await getBlock('hero', 'hero')
  const slot = await getSlotProduct('hero')

  const eyebrow  = hero?.eyebrow    ?? 'Disponible maintenant'
  const title    = hero?.title      ?? 'La fraîcheur, sans le bruit.'
  const subtitle = hero?.subtitle   ?? 'Ventilateurs, climatiseurs Inverter et téléviseurs connectés sélectionnés pour le climat de Dakar. Moteur bobiné cuivre, fonctionnement discret et garantie fabricant 2 ans.'
  const ctaLabel = hero?.ctaLabel   ?? 'Voir le catalogue'
  const ctaHref  = hero?.ctaHref    ?? '/catalogue'
  const cta2Label = String(hero?.data.cta2_label ?? 'Nous contacter')
  const cta2Href  = String(hero?.data.cta2_href  ?? '/contact')

  const featured = slot?.product ?? null

  const image = featured?.image ?? hero?.image ?? ''
  const imageAlt = featured
    ? `${featured.name}${featured.ref ? ` (réf. ${featured.ref})` : ''}`
    : (hero?.imageAlt ?? '')
  const priceLabel = featured
    ? `${new Intl.NumberFormat('fr-FR').format(featured.price).replace(/ /g, ' ')} FCFA`
    : null

  return (
    <section className="bg-bg-primary">
      <div className="container-site pt-14 pb-12 text-center sm:pt-20 sm:pb-16 lg:pt-24">

        <p className="eyebrow eyebrow-center">{eyebrow}</p>

        <h1
          className="display-xl mx-auto mt-4 max-w-5xl text-text-primary"
          style={{ fontSize: 'clamp(2.5rem, 8.5vw, 5.75rem)' }}
        >
          {title}
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-text-body sm:text-lg">
          {subtitle}
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <Link href={ctaHref} className="btn-outline px-8 py-3.5">
            {ctaLabel}
          </Link>
          {/* Le second bouton menait à WhatsApp et ouvrait une commande hors
              panier. Il mène au contact : la question trouve sa réponse, et la
              commande garde une seule porte. */}
          <Link href={cta2Href} className="link-underline text-text-primary">
            <span>{cta2Label}</span>
          </Link>
        </div>

        {/* Produit en grand format — le héros visuel */}
        {image && (
          <div className="mt-12 sm:mt-16">
            <Link
              href={featured ? `/produit/${featured.slug}` : '/catalogue'}
              className="group relative mx-auto block aspect-square w-full max-w-[520px]"
              aria-label={featured ? `Voir ${featured.name}` : 'Voir le catalogue'}
            >
              <Image
                src={image}
                alt={imageAlt}
                fill
                priority
                className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 90vw, 520px"
              />
              {slot && (
                <span className="absolute left-0 top-6 rounded-full bg-text-primary px-4 py-1.5 text-xs font-semibold text-white">
                  {slot.label}
                </span>
              )}
            </Link>

            {featured && (
              <p className="mt-6 text-sm text-text-muted">
                <span className="font-medium text-text-primary">{featured.name}</span>
                {featured.ref && <span> — Réf. {featured.ref}</span>}
                {priceLabel && (
                  <>
                    {' — '}
                    <span className="font-semibold text-text-primary">{priceLabel}</span>
                  </>
                )}
              </p>
            )}
          </div>
        )}

      </div>
    </section>
  )
}