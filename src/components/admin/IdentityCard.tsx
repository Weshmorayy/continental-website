'use client'

/**
 * IdentityCard — « qui est connecté », en bas de la barre latérale.
 *
 * Le portail ne montrait l'adresse qu'en gris très clair, en 0,68 rem, dans une
 * ligne tronquée : impossible à lire, et surtout impossible à distinguer d'une
 * ligne de mise en page. Or c'est l'information la plus utile quand un module
 * refuse une écriture — on vérifie d'abord qu'on n'est pas le mauvais compte,
 * ou qu'on n'a pas les droits.
 *
 * Trois éléments, dans cet ordre :
 *   1. l'adresse exacte, jamais tronquée ;
 *   2. le RÔLE porté par la ligne `site_admins` — car c'est lui qui décide, et
 *      non le rôle du compte Supabase Auth, qui n'a aucun rapport ;
 *   3. les modules réellement accordés, lus dans `myPermissions`.
 *
 * Pour un compte `admin`, la ligne 3 est remplacée par la mention « accès
 * complet » : afficher une liste de permissions pour quelqu'un qui n'en a pas
 * besoin ferait croire à des restrictions qui n'existent pas. Inversement, pour
 * un éditeur, la liste EST la seule information qui compte : c'est elle qui
 * explique qu'un module soit grisé.
 */

import { ShieldCheck, PenLine, LogOut, Check } from 'lucide-react'
import { useStore } from '@/context/StoreContext'

/**
 * Libellés des modules. La clé est celle de `site_admins.permissions` ; le
 * tableau existe parce que le nom technique (« shipping ») n'a pas sa place
 * dans une interface française.
 */
const MODULE_LABELS: Record<string, string> = {
  products: 'Produits',
  banners: 'Bannières',
  faq: 'FAQ',
  shipping: 'Livraison',
  content: 'Contenu du site',
  media: 'Médiathèque',
  backups: 'Sauvegardes',
  orders: 'Commandes',
  leads: 'Demandes',
  settings: 'Réglages',
}

/** Initiales pour le rond d'avatar : au plus deux lettres, jamais vides. */
function initials(email: string): string {
  const local = email.split('@')[0] ?? ''
  const parts = local.split(/[._-]+/).filter(Boolean)
  const letters = (parts.length > 1 ? parts[0][0] + parts[1][0] : local.slice(0, 2))
  return (letters || '??').toUpperCase()
}

export default function IdentityCard() {
  const { authEmail, myRole, myPermissions, signOut } = useStore()

  if (!authEmail) return null

  const isOwner = myRole === 'admin'
  const granted = Object.entries(myPermissions)
    .filter(([, level]) => typeof level === 'string' && level !== '')

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-text-primary text-[0.7rem] font-bold tracking-wide text-white"
        >
          {initials(authEmail)}
        </span>
        <div className="min-w-0">
          {/* `break-all` plutôt que `truncate` : un tronqué qui cache la fin
              de l'adresse ne sert à rien quand on cherche à vérifier le
              compte avec lequel on est connecté. */}
          <p className="break-all text-xs font-semibold leading-tight text-text-primary">
            {authEmail}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[0.68rem] text-text-muted">
            {isOwner ? (
              <>
                <ShieldCheck size={12} className="text-accent" aria-hidden="true" />
                Administrateur
              </>
            ) : (
              <>
                <PenLine size={12} aria-hidden="true" />
                Éditeur
              </>
            )}
          </p>
        </div>
      </div>

      {isOwner ? (
        <p className="text-[0.68rem] leading-relaxed text-text-muted">
          Accès complet à tous les modules.
        </p>
      ) : granted.length > 0 ? (
        <div>
          <p className="admin-label mb-1.5">Droits accordés</p>
          <ul className="space-y-1">
            {granted.map(([module, level]) => (
              <li key={module} className="flex items-center justify-between gap-2 text-[0.68rem]">
                <span className="truncate text-text-body">
                  {MODULE_LABELS[module] ?? module}
                </span>
                <span className="flex shrink-0 items-center gap-1 text-text-muted">
                  <Check size={11} className="text-accent" aria-hidden="true" />
                  {level === 'write' ? 'écriture' : 'lecture'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-[0.68rem] leading-relaxed text-text-muted">
          Aucun droit accordé pour l&apos;instant.
        </p>
      )}

      <button
        onClick={() => void signOut()}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-[0.7rem] font-medium transition-colors hover:bg-bg-tertiary"
      >
        <LogOut size={13} aria-hidden="true" />
        Se déconnecter
      </button>
    </div>
  )
}