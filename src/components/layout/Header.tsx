'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu, X, Search, ShoppingBag, ChevronRight, PhoneCall,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useStore } from '@/context/StoreContext'
import { whatsappLink } from '@/lib/settings'
import { useScrollLock } from '@/hooks/useScrollLock'

/*
 * Les adresses portent le slug RÉEL de la catégorie.
 *
 * Elles pointaient vers `ventilateur-pied` et `ventilateur-sol`, deux noms
 * absents de la table `categories` (la base dit `ventilateur-sur-pied`,
 * `ventilateur-mural`, `ventilateur-orbite`). Le catalogue ne trouvait donc
 * aucune catégorie correspondante et retombait sur la liste complète : le lien
 * « Ventilateurs » n'affichait pas les ventilateurs. La télévision n'avait
 * aucune entrée.
 */
const navLinks = [
  { label: 'Ventilateurs',      href: '/catalogue?cat=ventilateur-sur-pied' },
  { label: 'Climatiseurs',      href: '/catalogue?cat=climatiseur' },
  { label: 'Téléviseurs',       href: '/catalogue?cat=tv' },
  { label: 'Tout le catalogue', href: '/catalogue' },
  { label: 'Garantie & SAV',    href: '/garantie' },
  { label: 'À propos',          href: '/a-propos' },
  { label: 'Contact',           href: '/contact' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const { count, setOpen } = useCart()
  // L'en-tête est un composant CLIENT : il ne peut pas lire la base lui-même.
  // Il prend donc les réglages résolus au contexte, qui les a déjà chargés.
  const { siteConfig: cfg } = useStore()

  /*
   * Construit à chaque rendu, et non au chargement du module : le numéro vient
   * des réglages, donc le lien doit être reconstruit quand ils changent. Un
   * `const` de niveau module l'aurait figé avant même que la base soit lue — il
   * aurait conservé le numéro d'origine, exactement comme avant la correction.
   */
  const waHref = whatsappLink(
    cfg,
    "Bonjour Continental, je souhaite être conseillé pour un achat.",
  )

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /*
   * Même verrou que le tiroir du panier et les fenêtres de l'administration :
   * `hooks/useScrollLock`. Un `overflow: hidden` sur le seul `<body>` ne
   * suffit plus depuis que `html` est en `overflow-x: clip`.
   */
  useScrollLock(menuOpen)

  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <>
      {/* Barre blanche + filet 1px. Aucun bandeau d'annonce :
          samsung.com n'en a pas, la version précédente en avait un. */}
      <header
        className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
          scrolled ? 'shadow-[0_1px_12px_rgba(0,0,0,0.06)]' : ''
        }`}
      >
        <div className="w-full hairline">
          <div className="container-site flex items-center justify-between h-16 lg:h-20">

            <Link href="/" className="flex-shrink-0" aria-label="Continental® — accueil">
              {/*
                * Le logo est un BLOC vertical : la grande marque « C » posée
                * au-dessus du mot CONTINENTAL, et non une ligne de texte
                * horizontale. Ses proportions sont donc proches du carré
                * (400 × 231) là où l'ancien signe était une bande de
                * 1146 × 244.
                *
                * À 32 px de haut, le mot sous la marque tombait sous les six
                * pixels : l'ensemble se lisait comme une tache. La hauteur est
                * donc portée à 36/40/48 px selon l'écran, ce qui redonne au
                * mot une taille lisible sans changer la hauteur de la barre.
                *
                * width/height déclarent le VRAI rapport de l'image : un
                * rapport inventé réserve une boîte de la mauvaise largeur et
                * décale la navigation à l'instant où l'image se pose.
                */}
              <Image
                src="/brand/logo-light.png"
                alt="Continental®"
                width={400}
                height={231}
                className="h-9 sm:h-10 lg:h-12 w-auto object-contain"
                priority
              />
            </Link>

            {/* Navigation desktop */}
            <nav className="hidden lg:flex items-center gap-8" aria-label="Navigation principale">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-text-body hover:text-text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Icônes à droite, comme samsung.com */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/catalogue"
                className="p-2.5 text-text-primary hover:opacity-60 transition-opacity"
                aria-label="Rechercher dans le catalogue"
              >
                <Search size={22} strokeWidth={1.6} />
              </Link>

              {/* Le panier remplace l'icône WhatsApp sur les écrans étroits :
                  c'est désormais le geste principal, et un compteur visible vaut
                  mieux qu'une icône qui n'exprime aucune action. */}
              <button
                onClick={() => setOpen(true)}
                className="relative p-2.5 text-text-primary hover:opacity-60 transition-opacity"
                aria-label={count > 0 ? `Ouvrir le panier, ${count} article(s)` : 'Ouvrir le panier'}
              >
                <ShoppingBag size={22} strokeWidth={1.6} className="hidden sm:block" />
                <ShoppingBag size={20} strokeWidth={1.6} className="sm:hidden" />
                {count > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-text-primary px-1 text-[0.6rem] font-bold text-white"
                    aria-hidden="true"
                  >
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>

              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xl:inline-flex btn-accent px-5 py-2.5 text-xs ml-2"
              >
                <PhoneCall size={15} />
                Devis gratuit
              </a>

              <button
                onClick={() => setMenuOpen(true)}
                className="lg:hidden p-2.5 text-text-primary hover:opacity-60 transition-opacity"
                aria-label="Ouvrir le menu"
                aria-expanded={menuOpen}
              >
                <Menu size={24} strokeWidth={1.6} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Tiroir — structure calquée sur le menu samsung.com : champ de
          recherche, puis grande liste avec chevrons et filets verticaux */}
      {menuOpen && (
        <div className="fixed inset-0 z-[999999] flex" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            className="flex-1 bg-black/40 cursor-default"
            onClick={() => setMenuOpen(false)}
            aria-label="Fermer le menu"
            tabIndex={-1}
          />

          <div className="w-full max-w-md bg-white h-full overflow-y-auto flex flex-col">
            <div className="flex items-center gap-3 px-5 h-16 shrink-0">
              <div className="flex-1 relative">
                <Search
                  size={19}
                  strokeWidth={1.6}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
                <input
                  type="search"
                  placeholder="Rechercher un appareil"
                  aria-label="Rechercher un appareil"
                  className="w-full rounded-full border border-border bg-white py-2.5 pl-11 pr-4 text-sm
                             placeholder:text-text-muted focus:outline-none focus:border-text-primary"
                />
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 text-text-primary hover:opacity-60 transition-opacity flex-shrink-0"
                aria-label="Fermer le menu"
              >
                <X size={26} strokeWidth={1.6} />
              </button>
            </div>

            <nav className="px-5 pb-8" aria-label="Navigation mobile">
              <p className="product-ref text-text-muted uppercase tracking-[0.12em] pt-4 pb-1">
                Nos gammes
              </p>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center justify-between gap-4 py-4 border-b border-border last:border-b-0"
                >
                  <span className="display-md text-2xl text-text-primary group-hover:opacity-60 transition-opacity">
                    {link.label}
                  </span>
                  <span className="flex items-center h-full border-l border-border pl-5 flex-shrink-0">
                    <ChevronRight size={22} strokeWidth={1.5} className="text-text-muted" />
                  </span>
                </Link>
              ))}

              <div className="mt-8 flex flex-col gap-3">
                {/* La commande passe par le panier : c'est lui qui demande le
                    nom, le téléphone et la zone, et qui enregistre la
                    commande. Un raccourci WhatsApp depuis le menu ouvrait une
                    discussion sans rien enregistrer. */}
                <Link href="/panier" className="btn-accent w-full">
                  <ShoppingBag size={17} />
                  Voir mon panier
                </Link>
                <Link href="/catalogue" className="btn-outline w-full">
                  Voir tout le catalogue
                </Link>
              </div>

              <p className="mt-8 text-sm text-text-muted">
                {cfg.hours.weekdays} · {cfg.hours.saturday}
              </p>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
