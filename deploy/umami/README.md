# Mesure d'audience — Umami auto-hébergé

Ce dossier contient tout ce qu'il faut pour mettre en route la mesure
d'audience du site, et la brancher dans l'onglet **Statistiques** de
l'administration.

- `docker-compose.yaml` — Umami + son PostgreSQL, prêt à coller dans Coolify
- `.env.example` — les secrets, et la liste des variables du site

---

## Ce que ça change, et ce que ça ne change pas

L'onglet Statistiques sépare deux familles de chiffres, et cette séparation
reste la règle :

| | Source | Exemples |
|---|---|---|
| **Audience** | Umami | visiteurs uniques, visites, pages vues, durée, rebond, appareils, navigateurs, pays, sources |
| **Commerce** | Supabase | commandes, chiffre d'affaires, panier moyen, demandes |

Une visite n'est pas une vente. Les deux familles restent côte à côte dans
l'écran, jamais additionnées.

**Ce qui est réparé au passage.** L'ancien compteur écrivait une ligne dans
Supabase à chaque page vue. Il ne savait ni distinguer un visiteur d'un autre
(un rechargement recomptait), ni filtrer les robots, ni dire d'où venait le
visiteur, avec quel appareil. Et il ne s'arrêtait jamais : la table grossissait
sans limite. Umami règle ces quatre points, et garde l'historique indéfiniment
puisqu'il est chez vous.

---

## Ce qu'il faut faire, dans l'ordre

### 1. Créer la ressource dans Coolify

Coolify → **+ New** → **Docker Compose** (ou *Resource → Docker Compose*),
puis coller le contenu de `docker-compose.yaml`.

Générer les deux secrets et les saisir dans **Environment Variables** de la
ressource :

```bash
echo "UMAMI_DB_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=' | cut -c1-40)"
echo "UMAMI_APP_SECRET=$(openssl rand -base64 32)"
```

Le premier doit rester **sans** les caractères `@ : / ? # [ ]` — il est inséré
tel quel dans une URL de connexion PostgreSQL. La commande ci-dessus les
retire déjà.

### 2. Ouvrir Umami

Umami fabrique un domaine à partir de `SERVICE_FQDN_UMAMI_3000`. Si Coolify
n'en génère pas, le saisir à la main dans l'onglet **Domains** de la ressource
(port interne **3000**).

Le premier démarrage joue les migrations : compter une minute avant que la
page réponde. Si elle ne répond pas, consulter les journaux **du conteneur
umami**, pas de la base.

### 3. Se connecter, changer le mot de passe

Compte par défaut : `admin` / `umami`. Umami demande de le changer à la
première connexion.

> **Umami v3 : les sites appartiennent à une équipe.** Depuis la version 3, un
> site sans équipe n'est visible que de son créateur. Un compte de lecture
> ajouté à la main, mais absent de l'équipe, reçoit un **401** sur toutes les
> routes de statistiques — y compris si son rôle est correct. Les deux étapes
> ci-dessous vont donc ensemble : on ne peut pas sauter l'équipe.

### 4. Créer l'équipe, puis déclarer le site dedans

**Settings → Teams → Add team** — un nom neutre, par exemple `Atelier`.

Puis **Settings → Websites → Add website** :

- **Name** : `Continental`
- **Domain** : `continentalsn.com` (le domaine réel du site ; sert de filtre,
  il n'a pas besoin d'être exact tant qu'on ne mesure qu'un seul site)
- **Team** : `Atelier` ← c'est le champ qui compte

Umami affiche alors un **Website ID** (un UUID). C'est la valeur de
`NEXT_PUBLIC_UMAMI_WEBSITE_ID`.

⚠ Le rattachement à une équipe se choisit **à la création du site** et ne se
modifie plus ensuite depuis l'interface. Un site créé sans équipe doit être
recréé (il perd son historique) — donc vérifier ce champ avant de valider.

### 5. Créer le compte de lecture, et l'ajouter à l'équipe

**Settings → Users → Add user**

- **Username** : `continental-stats`
- **Role** : `View-only`
- **Password** : un mot de passe long, distinct de celui de l'admin

Puis **Settings → Teams → Atelier → Add user** → `continental-stats`, rôle
**View-only**. C'est cette seconde adhésion qui ouvre la lecture ; le rôle
global seul ne suffit pas.

Ce compte est celui que l'application utilise pour interroger l'API. Il lit les
statistiques et ne peut rien modifier : création, modification et suppression de
site répondent `401`. Le mot de passe n'est jamais envoyé au navigateur — il
n'est lu que par la route serveur qui, elle, vérifie d'abord que l'appelant est
administrateur du site.

*(Une seule équipe et un seul compte de lecture suffisent pour Continental et
MG Perfume, qui partagent cette instance : les deux sites vivent dans la même
équipe et le même identifiant de lecture lit les deux.)*

### 6. Renseigner les variables du site, puis REDÉPLOYER

Dans la ressource Coolify de `continental-website`, ajouter les variables (voir
`.env.example` pour le détail) :

```
NEXT_PUBLIC_UMAMI_URL=https://stats.continentalsn.com
NEXT_PUBLIC_UMAMI_WEBSITE_ID=<uuid affiché à l'étape 4>
UMAMI_URL=http://umami-<uuid>:3000
UMAMI_WEBSITE_ID=<le même uuid>
UMAMI_USERNAME=continental-stats
UMAMI_PASSWORD=<mot de passe de l'étape 5>
```

Deux familles, deux moments de lecture — c'est la distinction qui évite de
chercher longtemps pourquoi « les statistiques restent vides » :

| | Lues | Conséquence |
|---|---|---|
| `NEXT_PUBLIC_*` (2) | **au build**, figées dans le bundle | les changer exige un **redéploiement**, pas un redémarrage |
| `UMAMI_*` (4) | **à chaque requête** | les corriger suffit, sans reconstruire |

C'est pour cette raison que l'identifiant du site existe en deux exemplaires :
`UMAMI_WEBSITE_ID` (serveur) permet de faire vivre l'onglet Statistiques
**avant** que le domaine public d'Umami existe, `NEXT_PUBLIC_UMAMI_WEBSITE_ID`
n'étant nécessaire que pour le script de mesure côté visiteur.

**Ordre à respecter.** `UMAMI_URL` côté serveur peut viser le domaine interne
`http://umami-<uuid>:3000` : le serveur parle à Umami par le réseau Docker, et
l'onglet Statistiques fonctionne donc **dès maintenant, sans DNS**. Le script
visiteur, lui, ne peut pas être servi en `http://` depuis une page `https://`
(contenu mixte, bloqué par le navigateur) : `NEXT_PUBLIC_UMAMI_URL` doit
attendre le domaine réel. Tant qu'il est vide, aucun script n'est injecté et
aucune requête en échec n'apparaît dans la console.


### 7. Vérifier

1. Ouvrir une page du site public, puis, dans l'interface Umami
   (**Realtime**), la voir apparaître sous quelques secondes.
2. Ouvrir `/admin` → **Statistiques**. Les tuiles d'audience doivent se
   remplir, et le sélecteur de période fonctionner.

Si l'écran affiche « Mesure d'audience non configurée », c'est qu'une des
cinq variables manque — l'écran nomme celle qui pose problème.

---

## Notes d'exploitation

### Pièges de l'API v3 (rencontrés en vrai)

Trois choses ne se devinent pas et coûtent une soirée chacune :

1. **`path`, pas `url`.** En v3 le type de métrique « pages » s'appelle `path`.
   Avec `url` le serveur répond `400` — et comme `getAudience()` lance ses huit
   appels dans un `Promise.all`, un seul `400` vidait l'onglet Statistiques en
   entier. `type=host` n'existe pas non plus.
2. **Un site sans équipe est invisible aux autres comptes.** Le champ `teamId`
   ne se modifie **pas** après création : `POST /api/websites/{id}` n'accepte
   que `name`, `domain`, `shareId`, `replayConfig`. Il se choisit à la
   création (`POST /api/websites`, champ `teamId`).
3. **Le lecteur doit être membre de l'équipe** avec le rôle `team-view-only`
   (`POST /api/teams/{teamId}/users`). Le rôle global « View-only » ne suffit
   pas : sans adhésion, toutes les routes de stats répondent `401`.

L'API Umami n'utilise pas `PATCH` ni `PUT` : les mises à jour passent par
`POST` sur la ressource.

### Sauvegarde

La base Umami est un volume Docker. Elle se sauvegarde comme le reste :

```bash
docker compose exec umami-db pg_dump -U umami umami > umami-backup.sql
```

### Mise à jour

Changer l'étiquette de l'image dans `docker-compose.yaml` puis redéployer.
Umami joue ses migrations au démarrage. **Sauvegarder avant** : une migration
ne se défait pas.

### L'historique

Umami ne purge rien. La base contient une ligne par page vue, pour toujours.
Sur ce site, c'est négligeable (quelques milliers de lignes par an). Si un jour
le volume devient un sujet, le réglage tient dans Umami lui-même, pas dans le
code du site.

### Pourquoi `measure` et pas `script.js`

`TRACKER_SCRIPT_NAME: measure` dans le compose. Les listes de blocage
publicitaires filtrent le nom standard `script.js` sur des milliers de sites ;
le renommer suffit à ce que le script se charge chez la plupart des
visiteurs équipés d'un bloqueur. Le nom est cohérent des deux côtés : le
compose le fixe, `NEXT_PUBLIC_UMAMI_URL` ne contient que le domaine, et
l'application compose l'URL du script elle-même.

**Sans extension.** Umami v3 sert le tracker à `/<TRACKER_SCRIPT_NAME>` tel
quel : l'URL est `https://stats.continentalsn.com/measure`. `/measure.js`
répond **404** (vérifié par sonde HTTP le 2026-10-16) — un suffixe `.js` ajouté
par réflexe coupe la mesure sans message d'erreur.

### Les visites de l'administrateur ne comptent pas

L'administration n'est pas mesurée :

- le script de mesure n'est **pas chargé** sur `/admin` ;
- et comme Umami suit aussi les navigations internes, un filtre
  `data-before-send` **annule** l'envoi si le chemin commence par `/admin` —
  c'est le cas d'un passage du site public à l'administration sans
  rechargement.

Sinon, chaque consultation des statistiques par vous-même gonflerait les
chiffres que vous êtes en train de lire.

### Et le compteur Supabase ?

Il est **désactivé** dès que `NEXT_PUBLIC_UMAMI_URL` est renseignée, pour ne
pas écrire deux fois la même visite dans deux systèmes. Tant qu'Umami n'est pas
configuré, il reste actif : le site n'est jamais sans mesure, et un déploiement
peut se faire avant qu'Umami soit en ligne.
