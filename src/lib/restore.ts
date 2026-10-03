/**
 * restore.ts — Préparation des lignes lors d'une restauration.
 *
 * Une sauvegarde contient des lignes avec leur `id`, leur `created_at` et
 * leurs `updated_at`. Les réinsérer telles quelles échouerait sur deux
 * obstacles :
 *
 *   1. l'identifiant entre en conflit avec une ligne existante — ce qui est
 *      précisément le cas quand on restaure après une suppression ;
 *   2. PostgREST refuse l'insertion dès qu'une colonne n'est pas fournie, y
 *      compris `created_at`.
 *
 * On ne conserve donc que les colonnes métier, et on retire les champs que
 * la base sait remplir elle-même.
 */

/** Colonnes générées ou gérées par la base : jamais renvoyées à l'insertion. */
const STRIP = new Set([
  'id', 'created_at', 'updated_at', 'views',
  'public_token', 'product', 'category',
])

export function strip(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map((row) => {
    const out: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(row)) {
      if (STRIP.has(key)) continue
      out[key] = value
    }
    return out
  })
}