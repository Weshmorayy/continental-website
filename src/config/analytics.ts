/**
 * analytics.ts — Réglages de la mesure d'audience, côté navigateur.
 *
 * Ces valeurs sont lues à la CONSTRUCTION : `NEXT_PUBLIC_*` est remplacé par
 * sa valeur dans le fichier construit. Les modifier dans Coolify sans
 * redéployer ne change donc rien. C'est la cause la plus fréquente d'un
 * écran de statistiques qui reste vide.
 *
 * ── Le nom du script ──────────────────────────────────────────────────────
 * `measure.js` et non `script.js`. Le nom standard figure sur les listes de
 * blocage publicitaire, et un visiteur sur trois utilise un bloqueur. Le nom
 * est fixé des deux côtés (`TRACKER_SCRIPT_NAME` dans
 * `deploy/umami/docker-compose.yaml`, cette constante ici) : les changer
 * séparément couperait la mesure sans le moindre message d'erreur.
 */

/** Domaine public d'Umami, sans barre oblique finale. */
export const UMAMI_URL = (process.env.NEXT_PUBLIC_UMAMI_URL ?? '').trim().replace(/\/+$/, '')

export const UMAMI_WEBSITE_ID = (process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ?? '').trim()

/** `true` seulement si les deux variables publiques sont renseignées. */
export const isAnalyticsEnabled = Boolean(UMAMI_URL && UMAMI_WEBSITE_ID)

export const UMAMI_SCRIPT_SRC = isAnalyticsEnabled ? `${UMAMI_URL}/measure.js` : ''

/**
 * Nom de la fonction de filtrage, telle que `data-before-send` l'attend.
 * Umami lit ce nom dans l'attribut puis va le chercher sur `window` au moment
 * d'envoyer : la valeur est donc un NOM, pas un appel.
 */
export const BEFORE_SEND_HANDLER = '__continentalMesure'

/**
 * Filtre appliqué par Umami avant chaque envoi.
 *
 * Deux raisons, et une seule fonction :
 *
 *   1. **L'administration n'est pas une visite.** Un passage dans `/admin`
 *      ne compte pas : sans cela, chaque consultation des statistiques par
 *      l'administrateur gonflerait les chiffres qu'il est en train de lire.
 *
 *   2. **Un jeton de commande ne doit pas être recopié.** Une commande validée
 *      vit à l'adresse `/commande/<jeton>`, et ce jeton ouvre la fiche de la
 *      commande — nom, téléphone, adresse du client. Umami conserve les URL :
 *      le laisser passer reviendrait à archiver, dans une seconde base, de
 *      quoi accéder aux commandes. Le chemin est donc réécrit en
 *      `/commande/confirmation` AVANT de quitter le navigateur, et le jeton
 *      n'est jamais transmis.
 *
 * Le reste passe tel quel, y compris la chaîne de requête : c'est ce qui
 * permet de savoir quelle campagne a amené un visiteur (`?utm_source=…`).
 */
export const BEFORE_SEND_SOURCE = `
(function () {
  window.${BEFORE_SEND_HANDLER} = function (type, payload) {
    try {
      var url = new URL(payload.url, window.location.origin);

      if (url.pathname === '/admin' || url.pathname.indexOf('/admin/') === 0) {
        return false;
      }

      if (/^\\/commande\\/[^/]+\\/?$/.test(url.pathname)) {
        url.pathname = '/commande/confirmation';
        payload.url = url.toString();
      }

      return payload;
    } catch (error) {
      // Une URL illisible ne justifie pas de perdre la mesure : on envoie.
      return payload;
    }
  };
})();
`
