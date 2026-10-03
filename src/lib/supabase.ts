import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * supabase.ts — Accès à la base Continental®.
 *
 * UNE seule clé est utilisée par toute l'application : la clé publiable
 * (« anon »). Elle est publique par nature — elle est lisible dans le
 * navigateur — et ce n'est pas un problème, parce que ce qui protège les
 * données ce sont les politiques RLS de `supabase/002_rls.sql` :
 *
 *   • le visiteur ne lit que les produits publiés, bannières actives, FAQ,
 *     zones de livraison et réglages ;
 *   • il peut insérer une commande et une demande de contact, et rien d'autre ;
 *   • il ne lit JAMAIS les autres commandes ni les demandes des autres ;
 *   • il n'écrit sur le catalogue que s'il est authentifié ET listé dans
 *     `site_admins`.
 *
 * ⚠ La clé `service_role` ne doit jamais arriver ici. Elle contourne RLS :
 *   la mettre à portée du navigateur reviendrait à ouvrir le site entier à
 *   quiconque ouvre les outils de développement.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const SUPABASE_URL = url ?? ''
export const SUPABASE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? 'continental'

/**
 * `false` quand l'URL ou la clé manque. L'application bascule alors sur ses
 * données locales au lieu de planter : un build hors ligne doit aboutir, et
 * l'écran doit annoncer ce qui se passe plutôt que d'afficher du vide.
 */
export const isSupabaseConfigured =
  Boolean(url) &&
  Boolean(anonKey) &&
  url!.startsWith('https://') &&
  !url!.includes('votre-projet')

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        // Rappel : une "nouvelle" API key Supabase est une clé asymétrique
        // (ES256). On garde l'algorithme par défaut, qui la supporte.
        flowType: 'implicit',
      },
    })
  : null

/** Bucket de stockage, pour l'upload d'images depuis l'administration. */
export const storageBucket = SUPABASE_BUCKET