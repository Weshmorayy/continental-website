-- ══════════════════════════════════════════════════════════════════════════
-- Cadrage des images du site + logo choisi
-- ══════════════════════════════════════════════════════════════════════════
--
-- ── 1. Cadrage des images de contenu ──────────────────────────────────────
-- Les bannières savent déjà recadrer leur visuel (`banners.object_position`).
-- Les images pilotées depuis « Contenu du site » ne le savaient pas : un visuel
-- mal cadré obligeait à le retoucher dans un logiciel, puis à le redéposer.
--
-- Deux colonnes NULLABLES, et non `NOT NULL DEFAULT 'cover'`. La nuance
-- compte : NULL veut dire « je ne me prononce pas », et chaque section garde
-- alors le cadrage qu'elle a toujours eu — le héros en `contain` (le produit
-- entier doit rester visible), les cartes de gammes en `cover` (elles
-- remplissent leur cadre). Un défaut non nul aurait uniformisé les quatre
-- sections du jour au lendemain et recadré des visuels déjà validés par le
-- client.
--
-- NULL  = le cadrage d'origine de la section (aucun changement visible)
-- valeur = ce que l'administrateur a explicitement choisi
--
-- ── 2. Logo ───────────────────────────────────────────────────────────────
-- Le client change de logo. Plutôt que de figer le chemin dans le code — ce
-- qui demanderait un déploiement pour chaque essai —, le fichier choisi est
-- un réglage. Le réglage est vide par défaut : le site garde le logo livré
-- avec le dépôt (`/brand/logo-light.png`).
--
-- Les anciens fichiers restent dans `public/brand/legacy/` (voir le README de
-- ce dossier) : revenir au logo précédent ne demande donc aucune
-- reconstruction d'image, seulement de reposer un chemin.
--
-- Rejouable : `ADD COLUMN IF NOT EXISTS`.
-- ══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.content_blocks
  ADD COLUMN IF NOT EXISTS object_fit      TEXT,
  ADD COLUMN IF NOT EXISTS object_position TEXT;

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS brand JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Contrôle : les deux colonnes existent et acceptent NULL.
DO $$
DECLARE
  n INTEGER;
BEGIN
  SELECT count(*) INTO n
    FROM information_schema.columns
   WHERE table_name = 'content_blocks'
     AND column_name IN ('object_fit', 'object_position')
     AND is_nullable = 'YES';

  IF n <> 2 THEN
    RAISE EXCEPTION 'Il faut 2 colonnes nullables de cadrage, il y en a %', n;
  END IF;

  RAISE NOTICE 'Cadrage des images et réglage du logo : en place.';
END $$;
