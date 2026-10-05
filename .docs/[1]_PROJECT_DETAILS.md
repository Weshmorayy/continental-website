# [1] Continental® — Détails du projet

## Identité

| | |
|---|---|
| **Client** | Continental® |
| **Secteur** | Électroménager & climatisation — vente en ligne, commande WhatsApp |
| **Ville** | Dakar, Sénégal |
| **Slug** | `continental-website` |
| **Type** | Boutique en ligne (catalogue + commande WhatsApp, pas de paiement en ligne) |
| **Domaine** | `continentalsn.com` |
| **Repo** | `Weshmorayy/continental-website` (branche `main`, public) |
| **Base** | Supabase `tbaizfoircknsznmpcvb` (eu-west-1) |
| **Déploiement** | Coolify |

## Comptes de test

| Rôle | Compte | Droits |
|---|---|---|
| Agence | `admin@continentalsn.com` | Rôle `admin` — tout |
| Collaborateur | `editeur@continentalsn.com` | `products: read` |

> 🔴 **Le dépôt est public et ces mots de passe y figurent déjà**, dans
> `supabase/test_permissions.sh` qui a besoin de se connecter pour vérifier
> les droits. Ils sont donc publics depuis le début.
>
> **Action requise : les remplacer avant tout accès client.** Un mot de passe
> d'administration d'un site en production, dans un dépôt public, donne à un
> tiers le catalogue, les commandes et les demandes de ses clients.
>
> Les mots de passe ne sont volontairement pas recopiés ici. Ils sont fournis
> par le commanditaire dans Coolify et transmis oralement.

---

# La vision

## Ce que Continental a arrêté d'être

Le site public (`src/`) n'est **pas** administrable. C'est un site vitrine
figé, écrit dans des fichiers. Continental est le **premier site** d'une
famille : chaque nouveau client doit pouvoir recevoir le même traitement
sans que son site soit réécrit à la main.

## Le système Atelier

L'objectif est une plateforme de gestion pour agence, pas un site.

```
┌─────────────────────────────────────────────────────────────┐
│  Un portail d'administration unique                          │
│  ~/atelier/atelier-admin                                     │
│  • Un compte superadmin contrôle TOUS les sites clients      │
│  • Chaque site a ses modules, activables séparément          │
│  • Aucun site ne partage son contenu avec un autre           │
└─────────────────────────────────────────────────────────────┘
              │  pluggable onto any client site
              ▼
┌──────────────┬──────────────┬──────────────┬────────────────┐
│ Continental® │  Client B    │  Client C    │  …              │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

Exigences fixées au départ :

1. **« Tout ce qui peut être fait à distance se fait à distance »** — aucune
   intervention sur le code pour changer un texte, une image, un prix.
2. **Adaptable à chaque client** — la charte d'un site ne doit pas
   contraindre le portail, ni l'inverse.
3. **Un superadmin** qui pilote le système pour l'ensemble des sites.
4. **Comptes clients** — le client et l'agence ont chacun leur accès.
5. **Modules** : catalogue, commandes, demandes, contenu, bannières,
   livraison, FAQ, médiathèque, sauvegardes, utilisateurs, réglages,
   statistiques, journal.
6. **Journal d'activité** — qui a modifié quoi, et quand.
7. **Droits par module** — lecture ou écriture, module par module.

## Où en est cette vision

| Brique | État |
|---|---|
| Site public (accueil, catalogue, fiche, pages internes) | ✅ |
| Portail d'administration Continental | ✅ |
| Contenu piloté par l'admin (52 blocs sur 7 emplacements) | ✅ |
| Catalogue, commandes, demandes, FAQ, livraison, réglages | ✅ |
| Médiathèque + sauvegarde + restauration | ✅ |
| Journal d'activité et statistiques | ✅ |
| Droits par module, appliqués **par la base** | ✅ |
| Comptes de l'agence et des collaborateurs | ✅ |
| **Multi-clients : un seul tenant** | ❌ **bloquant** |
| Gestionnaire de blog | ⏸ reporté |
| Bannières sur la page d'accueil | ⏸ reporté |
| « Mis en avant » produit | ⏸ reporté |
| Filtre client final (suppression des placeholders) | ❌ à faire |

### Le blocage multi-clients

`site_admins` ne porte **aucune colonne `tenant`**. `can_module()` et
`is_site_owner()` filtrent sur le rôle seul, jamais sur le site. Conséquence
immédiate : **tous les comptes `admin` pilotent tous les sites** branchés sur
la même base. Acceptable avec un seul client ; le jour où Continental a un
concurrent, chaque directeur commercial voit le catalogue, les commandes et
les demandes de l'autre.

Les tables portent déjà `tenant_id` : le correctif est localisé, mais il
doit être fait **avant** le premier client supplémentaire.

## Règles du client

- **Monochrome.** Zéro couleur chaude. Noir `#000`, blanc `#fff`, gris
  `#f7f7f7 #eee #ddd #aaa #8f8f8f #757575 #555 #313131`. Détail dans
  `[2]_DESIGN_GUIDE.md`.
- **Prix en FCFA.** Séparateur de milliers : espace insécable. `30 000 FCFA`.
- **Aucun contenu inventé** — ni prix, ni adresse, ni témoignage.
- **WhatsApp** est le canal de commande. Pas de panier, pas de paiement
  en ligne.