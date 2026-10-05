-- =============================================================================
-- 014_can_module_vocabulary.sql — Réparer deux modules inaccessibles en écriture
-- =============================================================================
-- Symptôme rapporté
-- -----------------
-- Dans l'administration, en étant connecté comme administrateur, l'enregistrement
-- des coordonnées échouait : « Le champ « contact » n'a pas été enregistré :
-- écriture refusée. » La rélecture de contrôle avait bien fait son travail : le
-- refus est silencieux côté HTTP, et c'est la comparaison avec la valeur relue
-- qui l'a rendu visible.
--
-- Cause
-- ------
-- `can_module(p_table, p_need)` attend un NOM DE TABLE et le traduit en module
-- via `module_of()`. Sa première ligne est :
--
--     WHEN module_of(p_table) IS NULL THEN false
--
-- or deux politiques passaient le nom du MODULE au lieu du nom de la table :
--
--     site_settings   → can_module('settings',  'write')
--     site_backups    → can_module('backups',   'write')
--
-- `module_of('settings')` et `module_of('backups')` renvoient NULL (les tables
-- s'appellent `site_settings` et `site_backups`), donc `can_module` renvoyait
-- `false` à TOUT le monde — administrateur compris. Le raccourci
-- `role = 'admin'` placé plus bas n'était jamais atteint : il se trouve à
-- l'intérieur du EXISTS, après le CASE qui sort déjà en `false`.
--
-- Pourquoi personne ne l'avait vu
-- -------------------------------
-- Les dix autres modules passent un nom de table qui se trouve être identique à
-- leur module ('products' → 'products', 'media' → 'media'…). Ils fonctionnaient
-- donc PAR COINCIDENCE. `categories` → 'products' et `shipping_zones` →
-- 'shipping' marchaient eux aussi, par un raccourci assez heureux. Un module dont le nom
-- diffère de sa table était voué à l'échec, et rien dans la suite de tests ne
-- l'exerçait avec de vrais droits d'écriture.
--
-- Le correctif touche les deux niveaux
-- ------------------------------------
-- 1. `can_module()` accepte désormais un nom de table OU un nom de module, et
--    refuse explicitement tout ce qui n'est ni l'un ni l'autre. La fonction ne
--    dépend plus de la rigueur de celui qui écrit la politique.
-- 2. Les deux politiques repassent des noms de table, comme les dix autres.
--
-- Effet de bord vérifié : `site_backups` n'était lisible ET modifiable par
-- PERSONNE depuis sa création. La sauvegarde du site n'a jamais pu
-- s'exécuter. Ce défaut était invisible parce que l'écran concerné affichait
-- par ailleurs les mauvais enregistrements (cf. inversion du Promise.all).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. can_module() tolère les deux vocabulaires
-- -----------------------------------------------------------------------------
-- La liste des modules connus est écrite en dur. C'est volontaire : c'est
-- exactement la liste que `module_of()` produit, et l'écrire ici permet de
-- distinguer « l'appelant a passé un module » de « l'appelant a passé une
-- faute de frappe ». Une faute de frappe doit rester un refus, pas devenir un
-- accès : `can_module('produkt','write')` ne doit surtout pas se comporter
-- comme une permission sur 'produkt'.

CREATE OR REPLACE FUNCTION public.can_module(p_table text, p_need text DEFAULT 'read')
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH resolved AS (
    -- Priorité au nom de table ; à défaut, le nom est peut-être déjà un module.
    SELECT coalesce(public.module_of(p_table), p_table) AS module
  ), known AS (
    SELECT unnest(ARRAY[
      'products', 'banners', 'faq', 'shipping', 'content',
      'media', 'backups', 'orders', 'leads', 'settings'
    ]) AS module
  )
  SELECT CASE
    -- Module inconnu : aucune politique ne s'appliquera, donc refus explicite.
    WHEN (SELECT module FROM resolved) NOT IN (SELECT module FROM known)
      THEN false

    ELSE EXISTS (
      SELECT 1
      FROM public.site_admins a
      WHERE lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        AND (
          -- l'agence passe partout, sans avoir à cocher des cases
          a.role = 'admin'
          -- sinon, accord explicite. 'write' implique 'read' :
          -- on n'écrit pas sans avoir lu.
          OR CASE WHEN p_need = 'write'
                  THEN coalesce(a.permissions ->> (SELECT module FROM resolved), '') LIKE '%write%'
                  ELSE coalesce(a.permissions ->> (SELECT module FROM resolved), '') <> ''
             END
        )
    )
  END;
$function$;

COMMENT ON FUNCTION can_module(text, text) IS
  'Accepte un nom de table ou un nom de module. Refus explicite si le module est inconnu.';

-- -----------------------------------------------------------------------------
-- 2. Les deux politiques repassent des noms de table
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS settings_write ON public.site_settings;
CREATE POLICY settings_write ON public.site_settings
  FOR UPDATE TO authenticated
  USING      (can_module('site_settings', 'write'))
  WITH CHECK (can_module('site_settings', 'write'));

DROP POLICY IF EXISTS mod_write ON public.site_backups;
CREATE POLICY mod_write ON public.site_backups
  FOR ALL TO authenticated
  USING      (can_module('site_backups', 'write'))
  WITH CHECK (can_module('site_backups', 'write'));

DROP POLICY IF EXISTS mod_read ON public.site_backups;
CREATE POLICY mod_read ON public.site_backups
  FOR SELECT TO authenticated
  USING (can_module('site_backups', 'read'));

-- -----------------------------------------------------------------------------
-- 3. Garde-fou : aucune politique ne doit passer un nom de module
-- -----------------------------------------------------------------------------
-- Cette vue est ce que le test de non-régression interroge. Elle permet de
-- voir d'un coup d'œil, sans lire vingt-et-une politiques, si une future
-- modification ne réintroduit pas exactement le défaut corrigé ici.
--
-- Colonnes :
--   tablename  — la table protégée
--   argument   — ce que la politique passe à can_module()
--   resolved   — le module que can_module en déduit
--   ok         — true si la politique est correctement câblée

CREATE OR REPLACE VIEW public.public_policy_audit AS
SELECT
  p.tablename::text                             AS tablename,
  p.policyname::text                            AS policyname,
  m.argument                                    AS argument,
  public.module_of(m.argument)                  AS resolved,
  (public.module_of(m.argument) IS NOT NULL)    AS ok
FROM pg_policies p
CROSS JOIN LATERAL (
  -- Extrait le premier argument passé à can_module() dans la clause USING.
  SELECT substring(p.qual FROM 'can_module\(''([^'']+)''') AS argument
  WHERE p.qual LIKE '%can_module(%'
  UNION ALL
  SELECT substring(p.with_check FROM 'can_module\(''([^'']+)''') AS argument
  WHERE p.with_check LIKE '%can_module(%'
) m
WHERE m.argument IS NOT NULL;

COMMENT ON VIEW public.public_policy_audit IS
  'Vérifie que chaque politique can_module() reçoit un nom de table connu.';

GRANT SELECT ON public.public_policy_audit TO postgres, service_role;