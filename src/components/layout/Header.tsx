'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ShoppingBag, ShieldCheck, PhoneCall } from 'lucide-react'
import { siteConfig } from '@/config/site'

const navLinks = [
  { label: 'Accueil',       href: '/' },
  { label: 'Catalogue',     href: '/catalogue' },
  { label: 'Garantie & SAV',href: '/garantie' },
  { label: 'À Propos',      href: '/a-propos' },
  { label: 'Contact',       href: '/contact' },
]

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

  return (
    <>
      {/* Top Banner d'assurance client */}
      <div className="bg-bg-dark border-b border-border-dark text-text-light py-2 px-4 text-xs font-medium tracking-wide">
        <div className="container-site flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-text-light-sub">Service Commercial Dakar :</span>
            <a href={`tel:${siteConfig.contact.whatsapp}`} className="font-bold text-white hover:underline">
              {siteConfig.contact.phone}
            </a>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-text-light-sub">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-accent-light" /> Garantie Fabricant 2 Ans
            </span>
            <span>•</span>
            <span>Livraison Express Région Dakar</span>
          </div>
        </div>
      </div>

      {/* Header Navigation Principal */}
      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-200 bg-white border-b ${
          scrolled ? 'shadow-md border-border py-2.5' : 'border-border py-3.5'
        }`}
      >
        <div className="container-site flex items-center justify-between">

          {/* Logo Continental — Toujours 100% lisible et contrasté sur fond blanc */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="Continental® Sénégal">
            <div className="relative py-1">
              <Image
                src="/brand/logo-light.png"
                alt="Continental®"
                width={170}
                height={50}
                className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                priority
              />
            </div>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Navigation principale">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold tracking-wide transition-colors duration-150 relative py-1 ${
                    isActive
                      ? 'text-accent font-bold'
                      : 'text-text-body hover:text-accent'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* CTA desktop + hamburger mobile */}
          <div className="flex items-center gap-3">
            <Link
              href="/catalogue"
              className="hidden sm:inline-flex btn-accent text-xs font-bold uppercase tracking-wider px-5 py-2.5"
            >
              <ShoppingBag size={15} />
              Catalogue
            </Link>

            <a
              href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent('Bonjour Continental, je souhaite être conseillé pour un achat.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 border-2 border-emerald-600 text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white px-4 py-2 text-xs font-bold rounded-none uppercase tracking-wider transition-colors"
            >
              <PhoneCall size={14} />
              Devis Direct
            </a>

            {/* Hamburger bouton mobile */}
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 text-text-primary hover:bg-bg-secondary border border-border"
              aria-label="Ouvrir le menu"
            >
              <Menu size={24} />
            </button>
          </div>

        </div>
      </header>

      {/* Drawer mobile */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[999999] flex"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigation"
        >
          {/* Overlay sombre */}
          <div
            className="flex-1 bg-black/70 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          {/* Panneau latéral clair et ultra contrasté */}
          <div className="w-80 bg-white flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-bg-secondary">
              <Image
                src="/brand/logo-light.png"
                alt="Continental®"
                width={140}
                height={40}
                className="h-9 w-auto object-contain"
              />
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 text-text-primary hover:bg-white border border-border"
                aria-label="Fermer le menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col p-6 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`text-lg font-bold py-3 px-3 border-b border-border transition-colors ${
                    pathname === link.href ? 'text-accent bg-accent-light/50' : 'text-text-primary hover:text-accent'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto p-6 bg-bg-secondary border-t border-border flex flex-col gap-3">
              <Link
                href="/catalogue"
                onClick={() => setMenuOpen(false)}
                className="btn-accent w-full justify-center text-sm font-bold uppercase tracking-wider py-3.5"
              >
                <ShoppingBag size={16} />
                Voir le catalogue
              </Link>
              <p className="text-xs text-text-muted text-center font-medium">
                Service client : {siteConfig.contact.phone}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
