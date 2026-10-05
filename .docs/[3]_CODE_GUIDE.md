# [3] Code Guide — Continental®

## Architecture

Un seul site Next.js App Router. Le site public et le portail
d'administration sont **le même déploiement** : `/admin` est une route du
site, pas une application séparée.

```
src/
├── app/                    pages (une par route)
│   ├── page.tsx            accueil
│   ├── catalogue/          grille produits
│   ├── produit/[slug]/     fiche
│   ├── a-propos/ garantie/ contact/
│   └── admin/              portail
├── components/
│   ├── sections/           blocs de la page d'accueil
│   ├── ui/                 composants du SITE (design validé, ne pas modifier)
│   ├── layout/             Header, Footer
│   └── admin/              composants du ADMIN (tablettes, formulaires)
├── lib/
│   ├── atelier.ts          ⚠ la passerelle de contenu — voir plus bas
│   ├── supabase.ts         client navigateur + isSupabaseConfigured
│   ├── admin-types.ts      types du portail (≠ src/types/index.ts)
│   ├── seo.ts whatsapp.ts format.ts
├── context/
│   └── StoreContext.tsx    état du portail, mutations, permissions
└── data/products.ts        repli local (6 produits d'origine)
```

## La passerelle de contenu — `src/lib/atelier.ts`

**Un seul point d'accès à tout le contenu distant.** Aucun composant
n'importe `@supabase/supabase-js` ni `@/data/products` pour lire du contenu
distant : c'est ce qui permet de brancher l'administration sans réécrire les
composants.

Trois canaux, essayés dans l'ordre, avec repli automatique :

```
1. Supabase      NEXT_PUBLIC_SUPABASE_URL défini  → source: 'supabase'
2. API Atelier   ATELIER_ADMIN_URL défini        → source: 'admin'
3. Fichiers du dépôt (src/data/, constants)      → source: 'local'
```

`getSiteProducts()` retourne `{ products, source }` : la source est
affichée dans le portail, parce qu'un site qui sert du contenu périmé sans
le dire est impossible à diagnostiquer.

### Contenu éditorial — `getBlocks(slot)`

Chaque morceau de texte ou d'image modifiable du site est une ligne de
`content_blocks`. `slot` = la section (`hero`, `gammes`, `a-propos`…),
`key` = l'emplacement dans la section (`hero`, `gamme-1`, `stat-2`).

**Ajouter un emplacement est une donnée, pas une modification de code.**

### Ce qui est câblé et ce qui ne l'est pas

| Emplacement | Blocs | Câblé |
|---|---|---|
| `hero` | 1 | ✅ `HeroSection` |
| `gammes` | 4 | ✅ `GammesSection` |
| `engagements` | 5 | ✅ `ArgumentsSection` |
| `bestseller` | 1 | ✅ `BestsellerSection` |
| `a-propos` | 12 | ✅ `src/app/a-propos` |
| `garantie` | 12 | ✅ `src/app/garantie` |
| `contact` | 17 | ✅ `src/app/contact` |
| **`livraison`** | **3** | ❌ `LivraisonSection` — **à câbler** |
| **`catalogue-apercu`** | **2** | ❌ `CatalogueApercu` — **à câbler** |

Les 5 blocs des deux derniers emplacements existent en base et sont
modifiables dans le portail, mais **aucun composant ne les lit** : les
modifier ne change rien à l'affichage. C'est le prochain chantier.

> Les pages internes lisent leurs blocs **avec un repli en dur** :
> `by.get(key)?.[field] ?? 'texte d'origine'`. Un bloc supprimé en base ne
> casse donc pas la page, mais le texte d'origine redevient visible.

### Vérifier qu'un bloc est vraiment câblé

**Chercher le titre dans le HTML ne prouve rien.** Le bloc et le repli en dur
contiennent souvent le même texte : la page affiche la bonne valeur dans les
deux cas. C'est ce qui a fait croire que `/a-propos` était câblé — puis doubt
— alors que les deux sources étaient indiscernables.

Le seul test valable consiste à **modifier la valeur en base** et à observer
la page :

```sql
UPDATE content_blocks SET title='TITRE-TEMPORAIRE-VERIF'
 WHERE slot='a-propos' AND key='hero';
```

Puis attendre la revalidation et demander la page **deux fois** : la première
réponse est encore périmée, c'est la seconde qui régénère.

```bash
sleep 70
curl -s http://localhost:3200/a-propos | grep -o 'TITRE-TEMPORAIRE-VERIF'
```

Remettre la valeur d'origine et re-vérifier. C'est ainsi qu'a été confirmé
que les pages `/a-propos`, `/garantie` et `/contact` lisent bien la base.

## Le portail — `StoreContext.tsx`

`useStore()` expose tout : `products`, `orders`, `leads`, `admins`, `media`,
`backups`, `blocks`, `audits`, plus les mutations et les droits.

- `can(module, level)` — droit de l'utilisateur, lu depuis `my_permissions()`
- `isOwner` — rôle `admin`. Seuls eux voient Utilisateurs, Statistiques,
  Journal. Ces trois lectures sont **délibérément non accordables**.
- `audit()` — écrit dans `audit_events` à chaque action

## Commandes

```bash
npm run dev              # développement
npm run build            # build de production
npm run serve            # build PUIS démarrage sur :3200 (dans cet ordre)
node .next/standalone/server.js   # serveur standalone (Coolify)
```

> ⚠ Ne jamais lancer `next build` pendant que `next start` tourne : l'ancien
> HTML référence des chunks supprimés → *« Application error: a client-side
> exception »* côté visiteur. Tuer le serveur **avant** de reconstruire.

## Variables d'environnement

| Variable | Moment | Obligatoire |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **build** | oui |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **build** | oui |
| `NEXT_PUBLIC_SUPABASE_BUCKET` | **build** | oui |
| `NEXT_PUBLIC_SITE_URL` | build | non |
| `ATELIER_ADMIN_URL` | build | non — vide = repli local |
| `ATELIER_TENANT` | build | non |

Les `NEXT_PUBLIC_*` sont **remplacés par leur valeur littérale dans le
bundle au moment du build**. Ajouter la variable dans Coolify puis
redémarrer ne change rien : il faut **redéployer** pour qu'un nouveau build
les embarque.

## Conventions

- **Les composants du site (`components/ui`, `components/sections`,
  `components/layout`) sont un design validé.** Ne pas les modifier sans
  accord explicite.
- Les classes custom vivent dans `@layer components`, **jamais** dans
  `utilities`. En `utilities`, `.btn-accent { display:inline-flex }` passe
  après `.hidden { display:none }` et le bouton déborde sur mobile.
- Les classes du portail sont préfixées `admin-` et vivent dans le bloc
  admin de `src/app/globals.css`.
- Aucune interpolation dans les noms de classe Tailwind (`pill-${tone}`) :
  le scanner ne voit pas la classe, la règle disparaît du CSS compilé.