/**
 * deepEqual — comparaison profonde INSENSIBLE à l'ordre des clés.
 *
 * Pourquoi ce fichier existe
 * --------------------------
 * Postgres ne conserve pas l'ordre des clés d'un objet JSONB : il les
 * réordonne selon ses propres règles (longueur croissante, puis ordre
 * alphabétique). Un objet envoyé sous la forme
 *
 *   { "available": true, "freeForAll": true, "freeFrom": 50000 }
 *
 * revient donc relu en base sous la forme
 *
 *   { "freeFrom": 50000, "available": true, "freeForAll": true }
 *
 * Comparer les deux avec `JSON.stringify(a) !== JSON.stringify(b)` produit
 * alors un FAUX NÉGATIF : l'écriture a bien réussi, mais l'admin croit le
 * contraire et affiche « écriture refusée ».
 *
 * `deepEqual` compare la structure et les valeurs, pas la sérialisation :
 * deux objets identiques dont les clés sont rangées différemment sont égaux.
 *
 * Cas d'usage : uniquement des valeurs JSON (réglages, contenus, tableaux).
 * Les valeurs non JSON (Date, Map, Set) ne sont volontairement pas gérées,
 * à l'exception de Date qui est fréquente et traitée explicitement.
 */

function isPlainRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export function deepEqual(a: unknown, b: unknown): boolean {
  // Identité (couvre aussi le même objet, et les primitives égales).
  if (a === b) return true

  // `NaN` n'est pas égal à lui-même avec `===`, mais l'est pour nous.
  if (typeof a === 'number' && typeof b === 'number') {
    return Number.isNaN(a) && Number.isNaN(b)
  }

  // Types différents → différents (couvre null vs objet, string vs number…).
  if (typeof a !== typeof b) return false
  if (a === null || b === null) return false

  // Dates : comparer l'instant, pas les clés (une Date n'a pas de clés propres).
  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime()
  }

  // Tableaux : même longueur, même valeur à chaque indice, dans l'ordre.
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false
    if (a.length !== b.length) return false
    return a.every((v, i) => deepEqual(v, b[i]))
  }

  // Objets : mêmes clés (peu importe l'ordre), mêmes valeurs en profondeur.
  if (isPlainRecord(a) && isPlainRecord(b)) {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false
    return keysA.every(
      (k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]),
    )
  }

  // Reste : valeurs non JSON non gérées → comparaison stricte.
  return false
}
