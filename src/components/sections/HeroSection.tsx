import Image from 'next/image'
import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { getBlock } from '@/lib/atelier'

const waUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
  "Bonjour Continental, je souhaite obtenir des informations sur vos ventilateurs et climatiseurs."
)}`

/**
 * Héros — structure calquée sur samsung.com : colonne unique
 * CENTRÉE sur fond gris clair, sur-surtitre d'accent, titre très
 * gras, sous-titre, une seule action, puis le produit en grand
 * format en dessous.
 *
 * La version précédente était un split deux colonnes (texte à
 * gauche, image à droite) — c'est précisément ce qui ne
 * ressemblait pas à Samsung.
 */
export default async function HeroSection() {
  // Contenu piloté depuis l'administration. Les valeurs ci-dessous sont le
  // repli : sans base, ou si le bloc a été masqué, le héros reste identique.
  const hero = await getBlock('hero', 'hero')

  const eyebrow    = hero?.eyebrow    ?? 'Disponible maintenant'
  const title      = hero?.title      ?? 'La fraîcheur, sans le bruit.'
  const subtitle   = hero?.subtitle   ?? 'Ventilateurs et climatiseurs Inverter sélectionnés pour le climat de Dakar. Moteur bobiné cuivre, fonctionnement discret et garantie fabricant 2 ans.'
  const ctaLabel   = hero?.ctaLabel   ?? 'Voir le catalogue'
  const ctaHref    = hero?.ctaHref    ?? '/catalogue'
  const cta2Label  = String(hero?.data.cta2_label ?? 'Commander sur WhatsApp')
  const image      = hero?.image      ?? '/products/ventilateur-pied-fs4011.jpg'
  const imageAlt   = hero?.imageAlt   ?? 'Ventilateur sur pied Continental FS4011 avec télécommande'
  const caption    = hero?.data.caption ? String(hero.data.caption) : null
  const captionPrice = hero?.data.caption_price ? String(hero.data.caption_price) : null

  return (
    <section className="bg-bg-primary">
      <div className="container-site pt-14 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 text-center">

        <p className="eyebrow eyebrow-center">{eyebrow}</p>

        <h1
          className="display-xl text-text-primary mx-auto mt-4 max-w-5xl"
          style={{ fontSize: 'clamp(2.5rem, 8.5vw, 5.75rem)' }}
        >
          {title}
        </h1>

        <p className="mt-6 mx-auto max-w-xl text-base sm:text-lg text-text-body leading-relaxed">
          {subtitle}
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link href={ctaHref} className="btn-outline px-8 py-3.5">
            {ctaLabel}
          </Link>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline text-text-primary"
          >
            <span>{cta2Label}</span>
          </a>
        </div>

        {/* Produit en grand format — le héros visuel */}
        <div className="mt-12 sm:mt-16">
          <div className="relative mx-auto w-full max-w-[520px] aspect-square">
            <Image
              src={image}
              alt={imageAlt}
              fill
              priority
              className="object-contain"
              sizes="(max-width: 640px) 90vw, 520px"
            />
          </div>

          {(caption || captionPrice) && (
            <p className="mt-6 text-sm text-text-muted">
              {caption}{caption && captionPrice ? ' — ' : ''}
              {captionPrice && (
                <span className="font-semibold text-text-primary">{captionPrice}</span>
              )}
            </p>
          )}
        </div>

      </div>
    </section>
  )
}
