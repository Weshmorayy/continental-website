# [7] Problèmes récurrents

Registre. Cause racine et solution dans `.docs/Issues/`. **Append
uniquement.**

> Tous les problèmes ci-dessous ont été détectés **après** coup, jamais par
> la lecture du code. Ils partagent le même symptôme : rien ne signale l'erreur.

#### [1]. RLS activée sans policy
**Date** : 05-10-2026-00-38
**Description** : `media` et `site_backups` avaient des policies mais RLS désactivée : la sauvegarde était lisible par n'importe quel visiteur.
**Lien** : [.docs/Issues/[1]-04-10-2026-00-38_RLS_Sans_Policy.md](.docs/Issues/[1]-04-10-2026-00-38_RLS_Sans_Policy.md)

#### [2]. Un test de sécurité sur des tables vides
**Date** : 05-10-2026-00-38
**Description** : Les 20 contrôles passaient au vert sans rien tester, aucune donnée n'ayant été insérée. Une policy inactive passait inaperçue.
**Lien** : [.docs/Issues/[2]-04-10-2026-00-38_Test_Sur_Table_Vide.md](.docs/Issues/[2]-04-10-2026-00-38_Test_Sur_Table_Vide.md)

#### [3]. Un test de sécurité qui détruit sa donnée
**Date** : 05-10-2026-00-38
**Description** : Le test des droits supprimait un vrai produit ; le jour où les droits ont été élargis, le produit a disparu du catalogue.
**Lien** : [.docs/Issues/[3]-04-10-2026-00-38_Test_Destructeur.md](.docs/Issues/[3]-04-10-2026-00-38_Test_Destructeur.md)

#### [4]. Un collaborateur ne peut pas prouver qu'il est collaborateur
**Date** : 05-10-2026-00-38
**Description** : La connexion exigeait de lire `site_admins`, que la RLS réservait aux `admin`. Boucle : l'éditeur se verrouille dehors.
**Lien** : [.docs/Issues/[4]-04-10-2026-00-38_Collaborateur_Bloque.md](.docs/Issues/[4]-04-10-2026-00-38_Collaborateur_Bloque.md)

#### [5]. L'image téléversée reste invisible
**Date** : 05-10-2026-00-38
**Description** : Le sélecteur enregistrait le chemin du fichier au lieu de son adresse. Le site demandait `/produits/photo.png` : 404 silencieux.
**Lien** : [.docs/Issues/[5]-04-10-2026-00-38_Image_Invisible.md](.docs/Issues/[5]-04-10-2026-00-38_Image_Invisible.md)

#### [6]. La fiche produit renvoie 404
**Date** : 05-10-2026-00-38
**Description** : `getSiteProduct()` ne lisait que les fichiers du dépôt. Tout produit créé dans le portail s'affichait dans le catalogue sans page.
**Lien** : [.docs/Issues/[6]-04-10-2026-00-38_Fiche_Produit_404.md](.docs/Issues/[6]-04-10-2026-00-38_Fiche_Produit_404.md)

#### [7]. Des variables d'environnement lues au mauvais moment
**Date** : 05-10-2026-00-38
**Description** : Les `NEXT_PUBLIC_*` sont figées au build. Les saisir dans Coolify puis redémarrer ne produit aucun changement.
**Lien** : [.docs/Issues/[7]-04-10-2026-00-38_Variables_Au_Demarrage.md](.docs/Issues/[7]-04-10-2026-00-38_Variables_Au_Demarrage.md)