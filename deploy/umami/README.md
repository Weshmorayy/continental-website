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

### 4. Déclarer le site

**Settings → Websites → Add website**

- **Name** : `Continental`
- **Domain** : `continentalsn.com` (le domaine réel du site ; sert de filtre,
  il n'a pas besoin d'être exact tant qu'on ne mesure qu'un seul site)

Umami affiche alors un **Website ID** (un UUID). C'est la valeur de
`NEXT_PUBLIC_UMAMI_WEBSITE_ID`.

### 5. Créer le compte de lecture

**Settings → Users → Add user**

- **Username** : `continental-stats`
- **Role** : `Viewer`
- **Password** : un mot de passe long, distinct de celui de l'admin

C'est ce compte que l'application utilisera pour interroger l'API. Le rôle
« Viewer » suffit à lire les statistiques et ne permet pas de modifier Umami.
Le mot de passe n'est jamais envoyé au navigateur : il n'est lu que par la
route serveur qui, elle, vérifie d'abord que l'appelant est administrateur du
site.

### 6. Renseigner les variables du site, puis REDÉPLOYER

Dans la ressource Coolify de `continental-website`, ajouter les cinq
variables (voir `.env.example` pour le détail) :

```
NEXT_PUBLIC_UMAMI_URL=https://umami-xxxxxxxx.coolify.example
NEXT_PUBLIC_UMAMI_WEBSITE_ID=<uuid affiché à l'étape 4>
UMAMI_URL=https://umami-xxxxxxxx.coolify.example
UMAMI_USERNAME=continental-stats
UMAMI_PASSWORD=<mot de passe de l'étape 5>
```

⚠ Les deux variables `NEXT_PUBLIC_*` sont **remplacées par leur valeur au
moment du build**. Les ajouter puis redémarrer le conteneur ne change rien : il
faut **redéployer**. C'est la cause la plus fréquente d'un « les statistiques
restent vides ».

Les trois autres sont lues au moment de l'exécution : les corriger suffit sans
rebuild.

### 7. Vérifier

1. Ouvrir une page du site public, puis, dans l'interface Umami
   (**Realtime**), la voir apparaître sous quelques secondes.
2. Ouvrir `/admin` → **Statistiques**. Les tuiles d'audience doivent se
   remplir, et le sélecteur de période fonctionner.

Si l'écran affiche « Mesure d'audience non configurée », c'est qu'une des
cinq variables manque — l'écran nomme celle qui pose problème.

---

## Notes d'exploitation

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

### Pourquoi `measure.js` et pas `script.js`

`TRACKER_SCRIPT_NAME: measure` dans le compose. Les listes de blocage
publicitaires filtrent le nom standard `script.js` sur des milliers de sites ;
le renommer suffit à mesure que le script se charge chez la plupart des
visiteurs équipés d'un bloqueur. Le nom est cohérent des deux côtés : le
compose le fixe, `NEXT_PUBLIC_UMAMI_URL` ne contient que le domaine, et
l'application compose l'URL du script elle-même.

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
