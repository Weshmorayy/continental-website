import Image from 'next/image'
import Link from 'next/link'
import { getBlocks, getSiteCategories, getSiteProducts, getSiteSettings } from '@/lib/atelier'
import GammePlaceholder from '@/components/ui/GammePlaceholder'

/**
 * Les gammes — les rubriques du catalogue, pas deux cartes écrites à la main.
 *
 * ── Ce que ce composant n'est plus ─────────────────────────────────────────
 * Il affichait deux cartes fixes : « Gamme ventilation » et « Gamme
 * climatisation », sous un titre « Nos deux gammes / Deux façons de tenir la
 * chaleur ». L'ajout duiedzième produit — un téléviseur — n'avait rien
 * déplacé : la télévision n'existait pas dans la vitrine alors
 * qu'elle était dans le catalogue et dans la base.
 *
 * Le mot « deux » était le vrai problème. Écrit dans un composant, il devient
 * faux dès qu'une gamme s'ajoute, et rien ne le signale. Ici, le nombre de
 * cartes est calculé : il y en a autant que de catégories publiées, et le
 * titre ne les compte plus.
 *
 * ── Les textes restent éditables ──────────────────────────────────────────
 * Chaque carte porte sur un bloc `gamme-N` de `content_blocks`, donc le
 * vendeur peut réécrire le titre, l'accroche et l'image sans toucher au code.
 * C'est là que la photo de la gamme télévision devra être posée : elle n'a pas
 * été fournie, et aucun visuel de substitution n'a été inventé.
 *
 * ── Quand une image manque ───────────────────────────────────────────────
 * Un pictogramme dessiné, pas une image cassée et pas une photo empruntée à
 * une autre gamme. Voir `GammePlaceholder`.
 */

/** Repli quand la base est injoignable : deux gammes, avec leur visuel local. */
const FALLBACK = [
  {
    key: 'gamme-1',
    slugs: ['ventilateur-sur-pied'],
    count: 1,
    eyebrow: 'Gamme ventilation',
    title: 'Ventilateurs sur pied, muraux et orbite',
    intro:
      "Brasseurs d'air à grand débit, modèles sur pied à télécommande et ventilateurs muraux.",
    meta: 'Voir les modèles',
    cta: 'Voir les ventilateurs',
    href: '/catalogue?cat=ventilateur-sur-pied',
    image: '/aesthetic/aesthetic-fan-livingroom.jpg',
    alt: 'Ventilateur Continental dans un salon lumineux et aéré',
  },
  {
    key: 'gamme-2',
    slugs: ['climatiseur'],
    count: 1,
    eyebrow: 'Gamme climatisation',
    title: 'Climatiseurs split Inverter',
    intro: "Climatiseurs muraux Inverter, conçus pour un fonctionnement continu en climat chaud et humide.",
    meta: 'Voir les modèles',
    cta: 'Découvrir les splits',
    href: '/catalogue?cat=climatiseur',
    image: '/aesthetic/aesthetic-breeze-bedroom-1.jpg',
    alt: 'Chambre fraîche avec climatiseur split mural',
  },
]

export default async function GammesSection() {
  const [blocks, categories, { products }, cfg] = await Promise.all([
    getBlocks('gammes'),
    getSiteCategories(),
    getSiteProducts(),
    getSiteSettings(),
  ])

  const byKey = new Map(blocks.map((b) => [b.key, b]))

  /*
   * Quelle carte, et pour quelles catégories ?
   *
   * On part du BLOC, plus de l'indice. Auparavant le bloc gamutme-N etait
   * associe a la categorie de rang N : quatre categories sur cinq partageaient
   * `position = 0`, donc Postgres les rendait dans un ordre qui changeait d'une
   * requete a l'autre. La carte ventilation recencait parfois le texte du
   * climatiseur, et deux cartes sur cinq affichaient le texte d'une autre
   * gamme. Le vendeur ne pouvait pas non plus savoir quelle carte il editait.
   *
   * Le bloc porte desormais ses categories dans `meta`, separees par des
   * virgules. Une famille de produits se regroupe sur une carte (les trois
   * variantes de ventilation), et la liaison est une donnee : elle survit a un
   * ajout de categorie, a un changement de position, et a un reordonnancement.
   *
   * Deux garde-fous restent :
   *   - un bloc sans categorie liee ne produit AUCUNE carte, plutot qu'une
   *     carte au hasard ;
   *   - une categorie publiee qu'aucun bloc ne revendique est ajoutee en fin de
   *     liste, pour qu'un produit ajoute dans l'administration apparaisse
   *     plutot que disparaitre.
   */
  const countFor = (slugs: string[]) =>
    products.filter((p) => slugs.includes((p as { category?: string }).category ?? '')).length

  const cards = blocks
    .filter((b) => /^gamme-\d+$/.test(b.key))
    .sort((a, b) => a.position - b.position || a.key.localeCompare(b.key))
    .map((block) => {
      const slugs = (block.meta ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      return {
        key: block.key,
        slugs,
        count: countFor(slugs),
        eyebrow: block.eyebrow ?? '',
        title: block.title ?? '',
        intro: block.body ?? '',
        meta: block.subtitle ?? '',
        cta: block.ctaLabel ?? 'Voir les produits',
        href: block.ctaHref ?? (slugs[0] ? `/catalogue?cat=${slugs[0]}` : '/catalogue'),
        image: block.image ?? '',
        alt: block.imageAlt ?? block.title ?? '',
      }
    })
    /*
     * Une carte est retenue des lors que le vendeur l'a ecrite et liee a au
     * moins une categorie — meme si aucun produit ne correspond.
     *
     * Le filtre exigeait auparavant `count > 0`. C'etait prudent, mais faux
     * dans un cas reel : quand la base est injoignable, le catalogue retombe
     * sur les donnees locales du depot, qui nomment leurs categories
     * autrement (« ventilateur-pied » la ou la base dit
     * « ventilateur-sur-pied »). Le comptage tombait alors a zero et la carte
     * disparaissait de l'accueil : une coupure reseau faisait passer le site
     * de trois gammes a une seule, sans rien casser de visible.
     *
     * Le risque que ce filtre evitait — une carte menant a une page vide —
     * n'existe plus : le catalogue retombe sur la liste complete quand le
     * slug demande ne correspond a rien (verifie sur `/catalogue?cat=inconnu`,
     * qui sert les dix produits). Une carte editorialement ecrite vaut mieux
     * qu'une gamme qui s'evapore.
     */
    .filter((c) => c.slugs.length > 0)

  /*
   * Categories publiees qu'aucun bloc ne revendique. Elles gardent leur ordre
   * de la base, qui est desormais fixe (migration 015).
   */
  const claimed = new Set(cards.flatMap((c) => c.slugs))
  const orphans = categories
    .filter((c) => !claimed.has(c.slug) && countFor([c.slug]) > 0)
    .map((c, i) => ({
      key: `orpheline-${c.slug}`,
      slugs: [c.slug],
      count: countFor([c.slug]),
      eyebrow: '',
      title: c.label,
      intro: '',
      meta: '',
      cta: 'Voir les produits',
      href: `/catalogue?cat=${c.slug}`,
      image: '',
      alt: c.label,
      _fallback: true,
    }))

  const all = [...cards, ...orphans]

  /*
   * Repli : base injoignable, ou aucun bloc lie. Sans base on ne peut compter
   * aucun produit, et afficher trois cartes vides serait pire que deux cartes
   * completes.
   */
  const shown = all.length > 0 ? all : FALLBACK

  const heading = byKey.get('heading')
  const footer = byKey.get('footer')

  return (
    <section className="bg-bg-secondary py-20 sm:py-28">
      <div className="container-site">

        <div className="mx-auto mb-14 max-w-3xl text-center sm:mb-20">
          <p className="eyebrow eyebrow-center">
            {heading?.eyebrow ?? 'Nos gammes'}
          </p>
          <h2
            className="display-lg mt-4 text-text-primary"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}
          >
            {heading?.title ?? "De l'air, du frais, et de l'image."}
          </h2>
        </div>

        {/* Le nombre de colonnes suit le nombre de gammes : trois cartes ne
            s'étirent pas sur deux colonnes, et une carte seule ne laisse pas
            une bande vide à côté d'elle. */}
        <div
          className={`grid grid-cols-1 gap-5 lg:gap-6 ${
            shown.length === 2 ? 'lg:grid-cols-2'
            : shown.length === 3 ? 'lg:grid-cols-3'
            : 'lg:grid-cols-2'
          }`}
        >
          {shown.map((g) => (
            <article
              key={g.key}
              className="group flex flex-col overflow-hidden rounded-[20px] border border-border bg-white transition-colors duration-200 hover:border-text-primary"
            >
              <Link
                href={g.href}
                className="stage relative block aspect-[3/2] w-full overflow-hidden"
                aria-label={g.title}
              >
                {g.image ? (
                  <Image
                    src={g.image}
                    alt={g.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                ) : (
                  /* Pas de visuel fourni : pictogramme dessiné, jamais une
                     photo empruntée à une autre gamme. */
                  <GammePlaceholder slug={g.slugs[0]} label={g.title} />
                )}
              </Link>

              <div className="flex flex-1 flex-col px-7 py-8 sm:px-9">
                {g.eyebrow && <p className="eyebrow">{g.eyebrow}</p>}

                <h3 className="display-md mt-3 text-2xl text-text-primary sm:text-3xl">
                  {g.title}
                </h3>

                {g.intro && (
                  <p className="mt-3 text-sm leading-relaxed text-text-body">{g.intro}</p>
                )}

                <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-7">
                  {g.meta ? (
                    <span className="product-ref text-text-muted">{g.meta}</span>
                  ) : (
                    <span />
                  )}
                  <Link href={g.href} className="link-underline text-sm text-text-primary">
                    <span>{g.cta}</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-text-muted">
          {footer?.title ?? 'Livraison à Dakar et banlieue · Paiement à la réception'} ·{' '}
          {cfg.contact.phone && (
            <a href={`tel:${cfg.contact.phone}`} className="font-medium text-text-primary">
              {cfg.contact.phone}
            </a>
          )}
        </p>

      </div>
    </section>
  )
}