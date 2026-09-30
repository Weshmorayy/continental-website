'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X, ShoppingBag } from 'lucide-react'

const navLinks = [
  { label: 'Accueil',   href: '/' },
  { label: 'Catalogue', href: '/catalogue' },
  { label: 'Contact',   href: '#contact' },
]

export default function Header() {
  const [scrolled,   setScrolled]   = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Verrouiller le scroll quand le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-bg-dark/95 backdrop-blur-sm border-b border-border-dark shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="container-site flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link href="/" className="relative flex-shrink-0" aria-label="Continental — Accueil">
            <Image
              src="/brand/logo-dark-bg.png"
              alt="Continental®"
              width={160}
              height={48}
              className="h-9 md:h-11 w-auto object-contain"
              priority
            />
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Navigation principale">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-light/70 hover:text-text-light transition-colors duration-250 tracking-wide uppercase"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA desktop + hamburger mobile */}
          <div className="flex items-center gap-4">
            <Link
              href="/catalogue"
              className="hidden md:inline-flex btn-accent text-xs tracking-widest uppercase"
            >
              <ShoppingBag size={14} />
              Commander
            </Link>

            {/* Hamburger — mobile uniquement */}
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden text-white p-2 -mr-2"
              aria-label="Ouvrir le menu"
            >
              <Menu size={24} />
            </button>
          </div>

        </div>
      </header>

      {/* Drawer mobile — monté à la racine */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[999999] flex"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigation"
        >
          {/* Overlay */}
          <div
            className="flex-1 bg-black/60"
            onClick={() => setMenuOpen(false)}
          />

          {/* Panel droit */}
          <div className="w-72 bg-bg-dark flex flex-col h-full">
            {/* Header drawer */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-border-dark">
              <Image
                src="/brand/logo-dark-bg.png"
                alt="Continental®"
                width={120}
                height={36}
                className="h-8 w-auto object-contain"
              />
              <button
                onClick={() => setMenuOpen(false)}
                className="text-white/60 hover:text-white p-1"
                aria-label="Fermer le menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Liens */}
            <nav className="flex flex-col gap-1 px-4 py-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-text-light/80 hover:text-text-light font-heading text-2xl font-bold py-3 px-2 border-b border-border-dark transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA bas de drawer */}
            <div className="mt-auto px-6 pb-8">
              <Link
                href="/catalogue"
                onClick={() => setMenuOpen(false)}
                className="btn-accent w-full justify-center text-sm tracking-widest uppercase"
              >
                <ShoppingBag size={16} />
                Voir le catalogue
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
