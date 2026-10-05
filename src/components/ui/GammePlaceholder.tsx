import { Fan, Tv, Snowflake, Package } from 'lucide-react'

/**
 * Placeholder graphique pour une gamme sans photo.
 *
 * ── Pourquoi un dessin et non une image générique ─────────────────────────
 * Trois solutions ont été envisagées avant celle-ci :
 *
 *   · une photo de banque d'office — interdite par les règles du projet, et de
 *     toute façon elle montrerait un appareil qui n'est pas vendu ici ;
 *   · une image locale préchargée dans `public/` — même problème, et il
 *     faudrait en ajouter une à chaque nouvelle gamme ;
 *   · un aplat gris vide — l'écran ressemble alors à une image cassée, ce qui
 *     décrédibilise la fiche bien davantage qu'une absence assumée.
 *
 * On dessine donc la silhouette de la GAMME : un ventilateur, un climatiseur, un téléviseur. Le rendu est un pictogramme monochrome sur la
 * même surface claire que les photos, avec le nom de la gamme en dessous. Le
 * visiteur voit un emplacement attendu, pas une panne — et l'administrateur
 * sait immédiatement quelle photo poser.
 *
 * Le pictogramme est choisi d'après le slug de la catégorie : c'est le seul
 * indice disponible, et il est toujours juste. Une gamme inconnue retombe
 * sur une boîte, qui ne prétend rien.
 */

const GLYPHS: Record<string, typeof Fan> = {
  ventilateur: Fan,
  fan: Fan,
  climatiseur: Snowflake,
  clim: Snowflake,
  tv: Tv,
  television: Tv,
  teleteleviseur: Tv,
}

function glyphFor(slug: string) {
  return GLYPHS[slug.toLowerCase()] ?? Package
}

export default function GammePlaceholder({
  slug,
  label,
  hint,
}: {
  slug: string
  label: string
  hint?: string
}) {
  const Glyph = glyphFor(slug)

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-4 bg-bg-secondary"
      role="img"
      aria-label={hint ? `${label} — illustration temporaire` : label}
    >
      <Glyph
        size={72}
        strokeWidth={0.8}
        className="text-text-muted"
        aria-hidden="true"
      />
      <p className="px-6 text-center text-xs tracking-wide text-text-muted">
        {label}
      </p>
    </div>
  )
}