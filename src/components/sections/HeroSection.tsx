import Image from 'next/image'
import Link from 'next/link'
import { siteConfig } from '@/config/site'

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
export default function HeroSection() {
  return (
    <section className="bg-bg-secondary">
      <div className="container-site pt-14 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 text-center">

        <p className="eyebrow eyebrow-center">Disponible maintenant</p>

        <h1
          className="display-xl text-text-primary mx-auto mt-4 max-w-5xl"
          style={{ fontSize: 'clamp(2.5rem, 8.5vw, 5.75rem)' }}
        >
          La fraîcheur, sans le bruit.
        </h1>

        <p className="mt-6 mx-auto max-w-xl text-base sm:text-lg text-text-body leading-relaxed">
          Ventilateurs et climatiseurs Inverter sélectionnés pour le climat de Dakar.
          Moteur bobiné cuivre, fonctionnement discret et garantie fabricant 2 ans.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link href="/catalogue" className="btn-outline px-8 py-3.5">
            Voir le catalogue
          </Link>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline text-text-primary"
          >
            <span>Commander sur WhatsApp</span>
          </a>
        </div>

        {/* Produit en grand format — le héros visuel */}
        <div className="mt-12 sm:mt-16">
          <div className="relative mx-auto w-full max-w-[520px] aspect-square">
            <Image
              src="/products/ventilateur-pied-fs4011.png"
              alt="Ventilateur sur pied Continental FS4011 avec télécommande"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 640px) 90vw, 520px"
            />
          </div>

          <p className="mt-6 text-sm text-text-muted">
            Ventilateur Télécommande 16&quot; —{' '}
            <span className="text-text-primary font-semibold">30.000 FCFA</span>
          </p>
        </div>

      </div>
    </section>
  )
}
