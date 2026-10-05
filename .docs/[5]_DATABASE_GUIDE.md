# [5] Guide Base de données — Continental®

Supabase `tbaizfoircknsznmpcvb` (eu-west-1). Migrations dans `supabase/`,
appliquées dans l'ordre avec `psql` (voir `.ops/continental/cn.sh`).

> ⚠ L'hôte direct `db.<ref>.supabase.co` est **IPv6 uniquement**. Depuis un
> poste sans IPv6, passer par le pooler
> `aws-0-eu-west-1.pooler.supabase.com` — c'est ce que fait `cn.sh`.

## Tables

| Table | Rôle | Colonnes notables |
|---|---|---|
| `tenants` | Sites clients | `slug`, `name` |
| `categories` | Gammes | `slug`, `kind` (`physical`/`service`) |
| `products` | Catalogue | `slug`, `ref_`, `price`, `specs` JSONB |
| `banners` | Bannières | `slot`, `position`, `object_position` |
| `shipping_zones` | Zones de livraison | `price`, `delay` |
| `faqs` | Questions | `category`, `position` |
| `orders` | Commandes | `ref_command`, `items` JSONB, `order_status` |
| `leads` | Demandes | `kind`, `status` |
| `site_settings` | Réglages du site | JSONB : `contact`, `social`, `seo`… |
| `media` | Médiathèque | `path` (nom dans le seau), `url` (adresse publique) |
| `site_backups` | Sauvegardes | 4 blobs JSONB |
| `pages` | Pages internes | |
| `content_blocks` | **Contenu éditorial** | `slot`, `key`, `eyebrow`…`data` JSONB |
| `audit_events` | Journal | append-only, déclenché |
| `site_admins` | Comptes et droits | `role`, `permissions` JSONB |

> `ref_` et non `ref` : `ref` est un mot réservé en SQL. La colonne a été
> renommée. Le nom est définitif, ne pas le « corriger ».

Toutes les tables portent `tenant_id`. **Rien ne s'en sert encore** — voir
le blocage multi-clients dans `[1]_PROJECT_DETAILS.md`.

## Migrations

| Fichier | Objet |
|---|---|
| `001_schema.sql` | 14 tables |
| `002_rls.sql` | RLS, lecture anonyme des contenus publiés |
| `003_storage.sql` | Seau public `continental` |
| `004_seed.sql` | 6 produits, 3 catégories, 6 zones, 6 FAQ |
| `005_content.sql` | `content_blocks`, `audit_events`, `log_event()` |
| `006_content_seed.sql` | Contenu éditorial |
| `007_permissions.sql` | `module_of()`, `can_module()` — remplace `admin_all` |
| `008_fix_rls.sql` | RLS manquante sur `media` et `site_backups` |
| `009_pages_seed.sql` | Blocs des pages internes |
| `010_admin_self_read.sql` | Un collaborateur lit sa propre ligne |
| `011_image_paths.sql` | Répare les images stockées en chemin |

## Sécurité — les règles qui comptent

### 1. RLS est *fail-closed*

L'absence de policy = refus **silencieux**. Aucun avertissement, aucune
erreur : PostgREST répond `[]`.

| Opération refusée | Réponse HTTP | Piège |
|---|---|---|
| SELECT / UPDATE / DELETE | `200` avec `[]` | **indiscernable d'un succès** |
| PATCH refusé | `204` | identique à un succès |
| DELETE refusé | `200`, corps vide | identique à un succès |

Toujours passer `Prefer: return=representation` et vérifier le contenu de
la réponse, jamais le code HTTP seul. Voir `mutate()` dans `StoreContext`.

### 2. Une policy qui existe sans RLS activé est inerte

`008_fix_rls.sql` corrigeait `media` et `site_backups` : les policies
étaient écrites mais `relrowsecurity` valait `false`. Les politiques
n'existent que si RLS est **activé** sur la table. La migration contient un
garde-fou qui échoue si un jour une table publique est oubliée.

### 3. Les droits sont appliqués par la base

`can_module(table, level)` est `SECURITY DEFINER`. Le rôle `admin` passe
partout ; sinon il faut une permission explicite `{ module: 'read'|'write' }`
dans `site_admins.permissions`. `'write'` implique `'read'`.

Cacher un onglet dans l'interface ne protège rien : c'est la base qui refuse.

### 4. `site_admins` : chacun sa ligne

`is_site_owner()` exige `role = 'admin'`. Un collaborateur ne pouvait donc
pas lire `site_admins` — or c'est cette lecture qui autorise la connexion
(`.issue` 4). `010_admin_self_read.sql` ouvre à chacun **sa propre ligne**,
et à elle seule.

## Vérification

```bash
bash supabase/test_permissions.sh    # 14 contrôles
psql -f supabase/test_rls.sql       # 20 contrôles
```

Les deux suites passent **avec de vraies données** : sans cela, un test de
sécurité sur des tables vides passe au vert sans rien prouver. Vérifié à
chaque ajout de migration.

> Les tests ne doivent **jamais** manipuler de données réelles : ils créent
> une sonde dédiée (`sonde-permissions`, `RLS-SONDE-1`) et ne suppriment
> que cela. Une version antérieure du test a supprimé un vrai produit du
> catalogue lorsque les droits ont été élargis.

## Variables d'environnement

- `.env.example` — la liste complète, avec le moment d'évaluation
- `.env.local` — développement local (git ignoré)
- **Coolify** — les trois variables sont saisies par le commanditaire. Les
  valeurs ne sont jamais écrites dans le dépôt.