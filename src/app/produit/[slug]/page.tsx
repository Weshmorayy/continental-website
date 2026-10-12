import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Phone, ShieldCheck } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import GalleryViewer from '@/components/ui/GalleryViewer'
import TechSpecTable from '@/components/ui/TechSpecTable'
import ProductCard from '@/components/ui/ProductCard'
import ProductViewCounter from '@/components/ProductViewCounter'
import AddToCart from '@/components/cart/AddToCart'
import VariantPicker from '@/components/ui/VariantPicker'
import { getProductBySlug, getRelatedProducts, type Product } from '@/data/products'
import { getSiteProducts, getSiteSettings } from '@/lib/atelier'
import { generatePageMetadata } from '@/lib/seo'

/**
 * Les routes sont générées depuis le contenu RÉEL (admin s'il répond, données
 * locales sinon). Sans cela, un produit ajouté dans l'admin n'aurait pas de
 * page tant qu'aucun rebuild n'aurait eu lieu.
 */
export async function generateStaticParams() {
  const { products: list } = await getSiteProducts()
  return list.map((p) => ({ slug: p.slug }))
}

/**
 * Le produit demandé, et trois voisins de sa gamme.
 *
 * ── Pourquoi une seule lecture ────────────────────────────────────────────
 * Le produit ET ses suggestions sortent désormais de la MÊME liste.
 *
 * C'est ce qui manquait. Les suggestions étaient tirées du tableau local du
 * dépôt (`getRelatedProducts`), qui ne contient que six maquettes antérieures
 * au passage en base, rangées sous `ventilateur-pied`, `ventilateur-sol` et
 * `climatiseur`. Le catalogue réel, lui, range ses produits sous
 * `ventilateur-sur-pied`, `ventilateur-mural`, `ventilateur-orbite`,
 * `climatiseur` et `tv`.
 *
 * Une seule de ces catégories se retrouvait des deux côtés : « climatiseur ».
 * Conséquence exacte et vérifiable — la fiche du climatiseur proposait trois
 * maquettes, et aucune autre fiche n'avait de suggestions du tout.
 *
 * ── Le repli local, et sa limite ──────────────────────────────────────────
 * Les données du dépôt restent utiles : sans base configurée, elles évitent
 * une vitrine vide. Elles ne servent donc QUE lorsque le catalogue distant n'a
 * rien rendu — jamais pour compléter une liste distante. C'est précisément
 * cette nuance qui laissait passer les maquettes : l'ancien code mélangeait
 * les deux sources sans jamais regarder laquelle avait répondu.
 *
 * Effet de bord voulu : un slug absent du catalogue réel mène à `notFound()`.
 * Les six maquettes n'ont plus d'adresse publique.
 *
 * ── Quand la gamme ne contient qu'un produit ──────────────────────────────
 * Cinq gammes existent, et trois ne comptent qu'un seul produit : orbite,
 * climatiseur, téléviseurs. Chercher des voisins DANS la gamme y donnait une
 * liste vide, donc aucune suggestion — la section disparaissait purement et
 * simplement. Compléter avec des maquettes était le défaut d'origine ;
 * la remplir avec des produits réels d'ailleurs est une réponse honnête,
 * à condition de ne pas prétendre qu'ils sont de la même gamme.
 *
 * D'où `sameGamme`, que l'écran utilise pour choisir son intertitre. Le
 * libellé suit ce qui est réellement montré : « Dans la même gamme » quand
 * c'est vrai, « Aussi au catalogue » sinon.
 */
async function loadCatalogue(slug: string): Promise<{
  product: Product | undefined
  related: Product[]
  sameGamme: boolean
}> {
  const { products: list, source } = await getSiteProducts()

  if (source === 'local') {
    const product = getProductBySlug(slug)
    return {
      product,
      related: product ? getRelatedProducts(product) : [],
      sameGamme: true,
    }
  }

  const product = list.find((p) => p.slug === slug)
  if (!product) return { product: undefined, related: [], sameGamme: true }

  const siblings = list.filter((p) => p.category === product.category && p.id !== product.id)
  const sameGamme = siblings.length > 0

  const related = (
    sameGamme ? siblings : list.filter((p) => p.id !== product.id)
  ).slice(0, 3)

  return { product, related, sameGamme }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { product } = await loadCatalogue(slug)
  if (!product) return {}

  /*
   * L'accroche n'annonce que ce qui existe : une fiche sans deuxième
   * caractéristique produisait « undefined. » dans l'extrait affiché par
   * Google. Le prix suit la même règle que la page — un prix à 0 ne s'annonce
   * pas « 0 FCFA », il s'annonce comme à demander.
   */
  const points = product.features.slice(0, 2).join('. ')
  const prix = product.price > 0
    ? `Prix : ${product.price.toLocaleString('fr-FR')} FCFA.`
    : 'Prix communiqué sur demande.'

  return generatePageMetadata({
    title: `${product.name} — Réf. ${product.ref}`,
    description: [
      `${product.name} Continental® (${product.ref}).`,
      points ? `${points}.` : '',
      prix,
      'Livraison à Dakar.',
    ].filter(Boolean).join(' '),
    path: `/produit/${product.slug}`,
    image: product.image,
  })
}

export default async function ProduitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { product, related, sameGamme } = await loadCatalogue(slug)
  if (!product) notFound()

  const cfg = await getSiteSettings()

  /*
   * Une fiche ne décline des modèles que si elle en porte PLUSIEURS.
   * Avec une seule variante, le sélecteur n'offrirait aucun choix tout en
   * déplaçant le prix et le panier dans un composant client : la fiche garde
   * donc sa mise en page d'origine, prix et bouton rendus par le serveur.
   */
  const hasVariants = (product.variants?.length ?? 0) > 1

  return (
    <>
      <Header />
      {/* Îlot client invisible : compte la consultation de la fiche.
          Voir le commentaire de ProductViewCounter pour pourquoi cela ne peut
          pas se faire depuis ce composant, qui est rendu sur le serveur. */}
      <ProductViewCounter slug={product.slug} />
      <main>
        <section className="bg-white py-12 sm:py-16">
          <div className="container-site">

            <nav className="flex items-center gap-2 mb-10" aria-label="Fil d'Ariane">
              <Link href="/" className="product-ref text-text-muted hover:text-text-primary transition-colors">
                Accueil
              </Link>
              <ChevronRight size={12} className="text-text-muted" aria-hidden="true" />
              <Link href="/catalogue" className="product-ref text-text-muted hover:text-text-primary transition-colors">
                Catalogue
              </Link>
              <ChevronRight size={12} className="text-text-muted" aria-hidden="true" />
              <span className="product-ref text-text-primary">{product.ref}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              <div className="lg:col-span-6 lg:sticky lg:top-28">
                <GalleryViewer images={product.images} productName={product.name} />
              </div>

              <div className="lg:col-span-6">
                {product.badge && (
                  <span className="inline-flex rounded-full bg-accent-light text-accent px-4 py-1.5 text-xs font-semibold mb-5">
                    {product.badge}
                  </span>
                )}

                <p className="eyebrow">{product.categoryLabel}</p>

                <h1
                  className="display-lg text-text-primary mt-3"
                  style={{ fontSize: 'clamp(1.85rem, 4vw, 2.75rem)' }}
                >
                  {product.name}
                </h1>

                <p className="product-ref text-text-muted mt-3">Réf. {product.ref}</p>

                {/* Le texte LONG s'affiche sous le titre.
                    *
                    * C'est l'inverse de ce qui était en place : la description
                    * courte y figurait, et le texte long plus bas, après la
                    * liste des caractéristiques. Sur une fiche, c'est
                    * l'inverse qui se défend — quelqu'un qui ouvre un produit
                    * veut savoir ce que c'est, pas lire un résumé avant de
                    * decouvrir l'article à la fin de la page.
                    *
                    * La description courte a été déplacée sur la carte du
                    * catalogue, où elle fait son travail : donner envie
                    * d'ouvrir la fiche. Elle était de toute façon illisible
                    * ici, réduite à une ligne sous le titre alors qu'elle
                    * servait d'accroche.
                    */}
                {product.description && (
                  <div className="mt-5 space-y-4">
                    {product.description
                      .split(/\n{2,}/)
                      .map((p, i) => (
                        <p key={i} className="leading-relaxed text-text-body">
                          {p}
                        </p>
                      ))}
                  </div>
                )}

                {hasVariants ? (
                  /* Fiche déclinée : le choix du modèle, son prix et l'ajout au
                     panier sont portés par le MÊME composant client — sinon le
                     prix affiché et la ligne commandée peuvent diverger. */
                  <VariantPicker
                    slug={product.slug}
                    name={product.name}
                    modelRef={product.ref}
                    image={product.image}
                    basePrice={product.price}
                    commonSpecs={product.specs}
                    variants={product.variants ?? []}
                  />
                ) : (
                  <div className="mt-8 py-7 hairline border-t border-border">
                    <span className="product-ref text-text-muted">Prix indicatif</span>
                    <p className="display-md text-text-primary text-3xl sm:text-4xl mt-1">
                      {/* Un prix à 0 est un champ vide, pas un prix. Sans ce
                          garde-fou la fiche annonçait « 0 FCFA » — soit un
                          produit gratuit, soit une fiche cassée. */}
                      {product.price > 0 ? (
                        <>
                          {product.price.toLocaleString('fr-FR')}{' '}
                          <span className="text-lg font-medium text-text-muted">FCFA</span>
                        </>
                      ) : (
                        <span className="font-medium">Prix sur demande</span>
                      )}
                    </p>
                    <p className="text-xs text-text-muted mt-2">
                      {product.price > 0
                        ? 'Confirmé à la commande'
                        : 'Appelez-nous : le tarif est communiqué au moment de la commande.'}
                    </p>
                  </div>
                )}

                <ul className="mt-8 space-y-3.5">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-text-body leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Sur une fiche déclinée, le tableau technique est rendu par le
                    sélecteur : il change avec le modèle choisi. Le garder ici
                    afficherait deux tableaux, dont un incomplet. */}
                {!hasVariants && (
                  <div className="mt-9">
                    <TechSpecTable specs={product.specs} />
                  </div>
                )}

                <p className="mt-8 flex items-center gap-3 text-sm text-text-body">
                  <ShieldCheck size={20} strokeWidth={1.5} className="text-accent flex-shrink-0" />
                  <span>
                    <strong className="text-text-primary font-semibold">Garantie 2 ans</strong>{' '}
                    — pièces et main-d&apos;œuvre incluses
                  </span>
                </p>

                <div className="mt-9 flex flex-col gap-3">
                  {/* Le panier est la seule action de commande.
                      Un bouton « Commander via WhatsApp » se tenait ici : il
                      ouvrait la discussion sans rien enregistrer — pas de
                      référence, pas de zone de livraison, pas de ligne dans
                      l'administration. Le vendeur recevait un message qu'il
                      devait ressaisir à la main, et une commande passée quand
                      personne ne regardait le téléphone n'existait tout
                      simplement pas.
                      Le panier demande le nom, le téléphone, la zone et
                      l'adresse, puis écrit la commande ; WhatsApp reste le
                      canal de conclusion, à l'étape suivante. */}
                  {/* Sur une fiche déclinée, l'ajout au panier vit dans le
                      sélecteur, avec le prix du modèle choisi : le laisser ici
                      ajouterait le prix de l'entrée de base quel que soit le
                      modèle affiché. */}
                  {!hasVariants && (
                    <AddToCart
                      slug={product.slug}
                      name={product.name}
                      modelRef={product.ref}
                      price={product.price}
                      image={product.image}
                      full
                    />
                  )}
                  <a
                    href={`tel:${cfg.contact.phone}`}
                    className="btn-outline w-full justify-center py-4"
                  >
                    <Phone size={17} />
                    Appeler pour un conseil
                  </a>
                </div>

                <p className="mt-5 flex items-center gap-2.5 text-xs text-text-muted">
                  <span className="w-2 h-2 rounded-full bg-[#1FA855]" aria-hidden="true" />
                  En stock — livraison 24 à 48 h à Dakar
                </p>
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="bg-bg-secondary py-16 sm:py-24">
            <div className="container-site">
              {/* L'intertitre décrit ce qui est réellement montré : trois
                  voisins de la même gamme, ou trois autres produits du
                  catalogue quand la gamme n'en compte qu'un. */}
              <p className="eyebrow eyebrow-center">
                {sameGamme ? 'Dans la même gamme' : 'Aussi au catalogue'}
              </p>
              <h2 className="display-lg text-text-primary text-center mt-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
                Vous pourriez aussi aimer.
              </h2>

              <div className="carousel-row -mx-5 px-5 sm:mx-0 sm:px-0 mt-12 pb-2">
                {related.map((p) => (
                  <div key={p.id} className="w-[78vw] max-w-[340px]">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
