'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ShoppingBag, PhoneCall, MapPin } from 'lucide-react'
import { siteConfig } from '@/config/site'

const navLinks = [
  { label: 'Accueil',        href: '/' },
  { label: 'Catalogue',      href: '/catalogue' },
  { label: 'Garantie & SAV', href: '/garantie' },
  { label: 'À Propos',       href: '/a-propos' },
  { label: 'Contact',        href: '/contact' },
]

const waHref = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
  "Bonjour Continental, je souhaite être conseillé pour un achat."
)}`

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Ferme le tiroir à chaque navigation
  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <>
      {/* Bandeau d'information — sable chaud, pas de bandeau noir */}
      <div className="bg-bg-tertiary border-b border-border text-text-primary">
        <div className="container-site flex items-center justify-between gap-4 py-2.5 text-[11px] sm:text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin size={13} className="text-accent flex-shrink-0" />
            <span className="truncate">
              Livraison &amp; installation à{' '}
              <span className="font-semibold">Dakar et banlieue</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-5 text-text-body">
            <span>Garantie fabricant 2 ans</span>
            <span className="w-px h-3 bg-border-dark/20" />
            <span>Paiement à la livraison</span>
          </div>
        </div>
      </div>

      {/* Navigation principale — transparente sur le hero, opaque au scroll */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-bg-primary/95 backdrop-blur-md border-b border-border shadow-[0_1px_20px_-12px_rgba(59,46,35,0.5)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="container-site flex items-center justify-between gap-4 py-4">
          <Link
            href="/"
            className="flex-shrink-0 group"
            aria-label="Continental® Sénégal — accueil"
          >
            <Image
              src="/brand/logo-light.png"
              alt="Continental®"
              width={170}
              height={48}
              className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-[1.03]"
              priority
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-9" aria-label="Navigation principale">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative py-1 text-sm font-medium transition-colors duration-200 ${
                    isActive ? 'text-accent font-semibold' : 'text-text-body hover:text-text-primary'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full bg-accent" />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wa px-4 sm:px-5 py-2.5 text-xs sm:text-sm"
            >
              <PhoneCall size={15} className="flex-shrink-0" />
              <span className="hidden sm:inline">Devis gratuit</span>
              <span className="sm:hidden">Devis</span>
            </a>

            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden inline-flex items-center justify-center p-2.5 rounded-full text-text-primary border border-border hover:border-accent hover:text-accent transition-colors"
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Tiroir mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-[999999] flex" role="dialog" aria-modal="true" aria-label="Menu navigation">
          <button
            className="flex-1 bg-text-primary/45 backdrop-blur-sm cursor-default"
            onClick={() => setMenuOpen(false)}
            aria-label="Fermer le menu"
            tabIndex={-1}
          />

          <div className="w-[85vw] max-w-sm bg-bg-primary flex flex-col h-full shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <Image
                src="/brand/logo-light.png"
                alt="Continental®"
                width={150}
                height={42}
                className="h-8 w-auto object-contain"
              />
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-full text-text-primary border border-border hover:border-accent hover:text-accent transition-colors"
                aria-label="Fermer le menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col p-5 gap-1" aria-label="Navigation mobile">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-2xl px-4 py-3.5 text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-accent-light text-accent font-semibold'
                        : 'text-text-primary hover:bg-bg-secondary'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            <div className="mt-auto p-5 border-t border-border flex flex-col gap-3 bg-bg-secondary">
              <Link
                href="/catalogue"
                className="btn-accent w-full text-sm font-semibold"
              >
                <ShoppingBag size={17} />
                Voir le catalogue
              </Link>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa w-full text-sm font-semibold"
              >
                <PhoneCall size={16} />
                {siteConfig.contact.phone}
              </a>
              <p className="text-xs text-text-muted text-center pt-1">
                {siteConfig.hours.weekdays} · {siteConfig.hours.saturday}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
