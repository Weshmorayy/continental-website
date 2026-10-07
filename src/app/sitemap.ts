import { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'
import { getSiteProducts } from '@/lib/atelier'

/**
 * Plan du site — construit sur le catalogue RÉEL.
 *
 * Il listait auparavant les six maquettes du dépôt, importées directement
 * (`products` de `@/data/products`). Deux conséquences, toutes deux invisibles
 * à l'œil :
 *
 *   • Google apprenait l'existence de six adresses qui n'ont aucun produit
 *     derrière — et, depuis que la fiche produit refuse un slug absent du
 *     catalogue réel, qui n'existent plus du tout ;
 *   • les dix produits réellement en vente n'y figuraient pas. Le plan du site
 *     ne servait donc à rien, ce qui est pire que de ne pas en avoir.
 *
 * `getSiteProducts()` rend le contenu de la base s'il répond, celui de l'admin
 * à défaut, et les données du dépôt en dernier recours. Le plan du site décrit
 * ainsi toujours ce que le visiteur peut réellement atteindre.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${baseUrl}/catalogue`, lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${baseUrl}/garantie`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/a-propos`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]

  const { products } = await getSiteProducts()

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/produit/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...productRoutes]
}
