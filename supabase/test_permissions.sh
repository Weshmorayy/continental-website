#!/data/data/com.termux/files/usr/bin/bash
# =============================================================================
# Vérification des AUTORISATIONS par module.
# Exécute les MÊMES appels HTTP qu'un navigateur, avec de vrais jetons : c'est
# la seule façon de savoir ce que voit réellement chaque rôle.
# =============================================================================
set -u

REF="tbaizfoircknsznmpcvb"
BASE="https://${REF}.supabase.co"
AK="sb_publishable_aOIC8uTrd0c5ptDhGdKrfg_fj14whBZ"
CN="$HOME/atelier/.ops/continental/cn.sh"

pass=0; fail=0
check() { # libellé, attendu, obtenu
  if [ "$2" = "$3" ]; then printf '  PASS  %s\n' "$1"; pass=$((pass+1))
  else printf '  FAIL  %s -- attendu %s, obtenu %s\n' "$1" "$2" "$3"; fail=$((fail+1)); fi
}

login() { # email motdepasse -> jeton
  curl -s -X POST "$BASE/auth/v1/token?grant_type=password" \
    -H "apikey: $AK" -H "Content-Type: application/json" \
    -d "{\"email\":\"$1\",\"password\":\"$2\"}" \
    | python3 -c "import sys,json;print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null
}

# rows : nombre de lignes renvoyées (une réponse refusée vaut 0, comme une
# réponse vide — c'est justement ce qu'il faut mesurer)
rows() { # table, token
  curl -s "$BASE/rest/v1/$1?select=*&limit=50" \
    -H "apikey: $AK" -H "Authorization: Bearer $2" \
    | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    print(len(d) if isinstance(d,list) else -1)
except Exception:
    print(-1)" 2>/dev/null
}

# emails : liste triée des e-mails visibles sur une table (séparés par des virgules).
# Permet de vérifier QUELS comptes un rôle voit, pas seulement combien.
emails() { # table, token
  curl -s "$BASE/rest/v1/$1?select=email&limit=50" \
    -H "apikey: $AK" -H "Authorization: Bearer $2" \
    | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    if not isinstance(d,list): print(-1)
    else: print(','.join(sorted(r.get('email','') for r in d)))
except Exception:
    print(-1)" 2>/dev/null
}

echo "═══ préparation : deux commandes et deux demandes de test ═══"
# Sonde STRICTEMENT DÉDIÉE aux tests.
#
# ⚠ Une version précédente de ce script essayait de supprimer un vrai produit
#   du catalogue pour vérifier qu'un collaborateur ne le pouvait pas. Le jour
#   où ses droits ont été élargis à « products:write », l'écriture a réussi et
#   le produit a disparu du site. Le test avait détruit sa propre donnée.
#
#   Un test de sécurité ne manipule JAMAIS de données réelles : il crée ce
#   dont il a besoin, et ne supprime que cela.
$CN -q <<'SQL'
INSERT INTO public.products (slug, name, price, is_active, features, images, specs)
VALUES ('sonde-permissions', 'Sonde de test', 1, false, '{}', '{}', '{}')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.orders (ref_command, customer_name, customer_phone, subtotal, total_amount, items)
VALUES ('TEST-AUTH-1','Client Alpha','+221 77 000 00 01',1000,1000,'[]'::jsonb),
       ('TEST-AUTH-2','Client Beta','+221 77 000 00 02',2000,2000,'[]'::jsonb)
ON CONFLICT (ref_command) DO NOTHING;
INSERT INTO public.leads (kind, name, phone, message)
VALUES ('contact','Alice Test','+221 77 000 00 03','message de test A'),
       ('devis','Bob Test','+221 77 000 00 04','message de test B')
ON CONFLICT DO NOTHING;
SQL

EDITOR=$(login editeur@continentalsn.com "motdepasse-editeur-2026")
ADMIN=$(login admin@continentalsn.com "continental-admin-2026")
[ -z "$EDITOR" ] && { echo "échec de connexion éditeur"; exit 1; }
[ -z "$ADMIN" ]  && { echo "échec de connexion admin";  exit 1; }

echo
echo "═══ l'agence (rôle admin) voit tout ═══"
check "agence lit les commandes"   "2" "$(rows orders "$ADMIN")"
check "agence lit les demandes"    "2" "$(rows leads "$ADMIN")"
check "agence lit le journal"     "1" "$([ "$(rows audit_events "$ADMIN")" -ge 1 ] && echo 1 || echo 0)"
check "agence lit les comptes"    "2" "$(rows site_admins "$ADMIN")"

echo
echo "═══ le collaborateur (droits : products=read) ═══"
check "ne lit PAS les commandes"  "0" "$(rows orders "$EDITOR")"
check "ne lit PAS les demandes"   "0" "$(rows leads "$EDITOR")"
check "ne lit PAS le journal"     "0" "$(rows audit_events "$EDITOR")"

# Un collaborateur voit SA PROPRE ligne d'administration — c'est ce qui lui
# permet de se connecter (cf. migration 010). Il ne doit voir AUCUN autre
# compte : c'est la liste des comptes de l'agence qui est confidentielle.
# Tester le nombre seul n'aurait pas distingué « rien » de « sa ligne ».
check "ne voit que son propre compte" "editeur@continentalsn.com" "$(emails site_admins "$EDITOR")"
check "ne voit PAS le compte de l'agence" "0" \
  "$(emails site_admins "$EDITOR" | tr ',' '\n' | grep -c '^admin@' || true)"

echo
echo "═══ écriture : lecture seule ne permet pas d'écrire ═══"
# On ne juge pas sur le CODE HTTP : PostgREST répond 204 (PATCH) ou 200 avec
# un corps vide (DELETE) dans les DEUX cas — réussite ou refus. Le seul
# critère fiable est l'état de la donnée après coup.

curl -s -o /dev/null -X PATCH \
  "$BASE/rest/v1/products?slug=eq.sonde-permissions" \
  -H "apikey: $AK" -H "Authorization: Bearer $EDITOR" -H "Content-Type: application/json" \
  -d '{"price":1}'
price=$($CN -tAc "SELECT price::text FROM products WHERE slug='sonde-permissions';")
check "prix de la sonde inchangé" "1.00" "$price"

curl -s -o /dev/null -X DELETE \
  "$BASE/rest/v1/products?slug=eq.sonde-permissions" \
  -H "apikey: $AK" -H "Authorization: Bearer $EDITOR" \
  -H "Prefer: return=representation"
alive=$($CN -tAc "SELECT count(*) FROM products WHERE slug='sonde-permissions';")
check "sonde toujours présente" "1" "$alive"

curl -s -o /dev/null -X DELETE \
  "$BASE/rest/v1/orders?ref_command=eq.TEST-AUTH-1" \
  -H "apikey: $AK" -H "Authorization: Bearer $EDITOR" \
  -H "Prefer: return=representation"
still=$($CN -tAc "SELECT count(*) FROM orders WHERE ref_command='TEST-AUTH-1';")
check "commande toujours présente" "1" "$still"

echo
echo "═══ escalade de droits ═══"
# Le collaborateur ne doit pas pouvoir s'accorder les commandes lui-même :
# c'est le scénario qui transformerait un portail cloisonné en portail ouvert.
curl -s -o /dev/null -X PATCH \
  "$BASE/rest/v1/site_admins?email=eq.editeur@continentalsn.com" \
  -H "apikey: $AK" -H "Authorization: Bearer $EDITOR" -H "Content-Type: application/json" \
  -H "Prefer: return=representation" -d '{"permissions":{"orders":"write"}}'

granted=$($CN -tAc "SELECT count(*) FROM site_admins WHERE email='editeur@continentalsn.com' AND permissions ? 'orders';")
check "permissions non escaladés" "0" "$granted"

after=$($CN -tAc "SELECT count(*) FROM orders;")
check "commandes toujours inaccessibles" "2" "$after"

echo
echo "═══ réglages et sauvegardes : les deux modules au nom différent ═══"
# RÉGRESSION — 2026-10-05. Les politiques de ces deux tables passaient le nom du
# MODULE a can_module() au lieu du nom de la TABLE. can_module() attendait un
# nom de table et renvoyait donc false pour TOUT le monde, administrateur
# compris : les coordonnées ne pouvaient plus etre enregistrees, et les
# sauvegardes ne pouvaient etre ni lues ni ecrites par personne.
#
# Ces deux controles ont longtemps passe sans erreur parce que la suite
# verifiait les AUTRES modules, dont le nom de table se trouve etre identique a
# leur module. Ils sont ici pour que la distinction soit Couverture, pas
# hasard.
#
# On ne juge pas sur le code HTTP : PostgREST repond 200 avec un corps vide a
# un refus comme a un succes. Seul l'etat de la donnee apres coup le dit.

# ─────────────────────────────────────────────────────────────────────────────
# AVANT D'ECRIRE : on retient la valeur reelle de la ligne.
#
# Cette suite verifie que l'administrateur PEUT ecrire les reglages. Pour le
# prouver, elle ecrit — avec une valeur fixe. Elle ecrasait donc les vraies
# coordonnees par le placeholder du depot, et rien ne le signalait : le test
# continuait de passer pendant que le numero disparaissait du site.
#
# Un test qui detruit la donnee qu'il surveille est une panne differee. La
# colonne est sauvegardee ici et remise en place au nettoyage, que les
# controles passent ou non.
# ─────────────────────────────────────────────────────────────────────────────
CONTACT_AVANT=$($CN -tAc "SELECT contact::text FROM site_settings WHERE id=1;")

curl -s -o /dev/null -X PATCH \
  "$BASE/rest/v1/site_settings?id=eq.1" \
  -H "apikey: $AK" -H "Authorization: Bearer $ADMIN" -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"contact":{"city":"Dakar","email":"","phone":"+221 77 000 00 00","address":"","country":"Senegal","whatsapp":"221770000000"}}'
phone=$($CN -tAc "SELECT contact->>'phone' FROM site_settings WHERE id=1;")
check "l'administrateur ecrit les coordonnees" "+221 77 000 00 00" "$phone"

curl -s -o /dev/null -X PATCH \
  "$BASE/rest/v1/site_settings?id=eq.1" \
  -H "apikey: $AK" -H "Authorization: Bearer $EDITOR" -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"contact":{"phone":"ECRITURE-INTERDITE"}}'
phone2=$($CN -tAc "SELECT contact->>'phone' FROM site_settings WHERE id=1;")
check "l'editeur n'ecrit toujours pas les reglages" "+221 77 000 00 00" "$phone2"

curl -s -o /dev/null -X POST \
  "$BASE/rest/v1/site_backups" \
  -H "apikey: $AK" -H "Authorization: Bearer $ADMIN" -H "Content-Type: application/json" \
  -H "Prefer: return=representation" -d '{"backup_name":"sonde-permissions-backup"}'
saved=$($CN -tAc "SELECT count(*) FROM site_backups WHERE backup_name='sonde-permissions-backup';")
check "l'administrateur cree une sauvegarde" "1" "$saved"

curl -s -o /dev/null -X POST \
  "$BASE/rest/v1/site_backups" \
  -H "apikey: $AK" -H "Authorization: Bearer $EDITOR" -H "Content-Type: application/json" \
  -H "Prefer: return=representation" -d '{"backup_name":"sonde-permissions-backup-editeur"}'
saved2=$($CN -tAc "SELECT count(*) FROM site_backups WHERE backup_name='sonde-permissions-backup-editeur';")
check "l'editeur ne cree pas de sauvegarde" "0" "$saved2"

echo
echo "═══ cablage des politiques ═══"
# Vue public_policy_audit : aucune politique ne doit passer a can_module() un
# nom qui ne soit pas une table connue. C'est le garde-fou du defaut corrige.
broken=$($CN -tAc "SELECT count(*) FROM public_policy_audit WHERE NOT ok;")
check "aucune politique mal cablee" "0" "$broken"

echo
echo "═══ nettoyage ═══"
$CN -q <<'SQL'
DELETE FROM public.orders   WHERE ref_command IN ('TEST-AUTH-1','TEST-AUTH-2');
DELETE FROM public.leads    WHERE name IN ('Alice Test','Bob Test');
DELETE FROM public.products  WHERE slug = 'sonde-permissions';
DELETE FROM public.site_backups WHERE backup_name LIKE 'sonde-permissions-backup%';
SQL

# Remise en place de la colonne ecrasee plus haut.
#
# Hors du heredoc ci-dessus : celui-ci n'accepte que du SQL, le shell y
# executerait litteralement les lignes de commande.
#
# Le JSON transite par une variable psql, jamais par interpolation dans la
# chaine SQL : une adresse contenant une apostrophe casserait la commande.
# La requete passe par l'ENTREE STANDARD, pas par `-c` : psql n'y interpole
# pas les variables, la ligne partait telle quelle au serveur et la
# restauration echouait en silence.
if [ -n "$CONTACT_AVANT" ]; then
  $CN -q -v saved="$CONTACT_AVANT" <<'RESTAURE' >/dev/null
UPDATE public.site_settings SET contact = :'saved'::jsonb WHERE id = 1;
RESTAURE
  check "les coordonnees reelles sont restaurees" "$CONTACT_AVANT" \
        "$($CN -tAc "SELECT contact::text FROM site_settings WHERE id=1;")"
fi

echo
echo "════════════════════════════════════════════"
printf 'PASS %d   FAIL %d\n' "$pass" "$fail"
[ "$fail" -eq 0 ] || exit 1
