'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, ShoppingBag, ChevronRight, PhoneCall } from 'lucide-react'
import { siteConfig } from '@/config/site'

const navLinks = [
  { label: 'Ventilateurs',   href: '/catalogue?cat=ventilateur-pied' },
  { label: 'Climatiseurs',    href: '/catalogue?cat=climatiseur' },
  { label: 'Tout le catalogue', href: '/catalogue' },
  { label: 'Garantie & SAV',  href: '/garantie' },
  { label: 'À propos',        href: '/a-propos' },
  { label: 'Contact',         href: '/contact' },
]

const waHref = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
  "Bonjour Continental, je souhaite être conseillé pour un achat."
)}`

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

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
              <Image
                src="/brand/logo-light.png"
                alt="Continental®"
                width={150}
                height={42}
                className="h-6 sm:h-7 lg:h-8 w-auto object-contain"
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

              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:block p-2.5 text-text-primary hover:opacity-60 transition-opacity"
                aria-label="Commander sur WhatsApp"
              >
                <ShoppingBag size={22} strokeWidth={1.6} />
              </a>

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
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-wa w-full"
                >
                  <PhoneCall size={17} />
                  Commander sur WhatsApp
                </a>
                <Link href="/catalogue" className="btn-outline w-full">
                  Voir tout le catalogue
                </Link>
              </div>

              <p className="mt-8 text-sm text-text-muted">
                {siteConfig.hours.weekdays} · {siteConfig.hours.saturday}
              </p>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
