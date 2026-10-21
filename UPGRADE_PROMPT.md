Rôle : Tech Lead RénoRoute. Lis d'abord AGENTS.md, docs/TASKS.md, docs/01-architecture.md, docs/03-database.md, docs/05-security.md et REVIEW.md (revue du 2026-10-20). Respecte AGENTS.md :
- TypeScript strict ;
- aucune chaîne visible en dur (t('ns.key') avec les clés dans packages/shared/src/i18n/fr.json ET en.json) ;
- BRAND comme source unique ;
- aucun secret ;
- IA côté serveur seulement ;
- tout fait non vérifié est marqué « à vérifier » ;
- les données de subventions et de prix vivent dans des tables modifiables par l'admin, jamais en dur.

Travaille en petits commits (Conventional Commits). Ne crée aucun compte tiers et ne pousse rien sans l'accord de Brown.

## Phase A — Corriger M0 (obligatoire avant M1)
1. **Git** : `git init`, branche `main`. Versionne `pnpm-lock.yaml`, car la CI utilise `--frozen-lockfile`. Lance `gitleaks detect --source . --config .gitleaks.toml` en local, puis fais le premier commit. Prépare un dépôt GitHub **privé** sans le créer : demande à Brown.
2. **.gitignore** : ajoute `docker.env`, `supabase/.env*`, `**/.env.local`, `apps/mobile/.maestro/output/`. Vérifie avec `git status --ignored` que `supabase/.temp/` et `supabase/.branches/` ne sont jamais suivis. Si `supabase/.temp` ou `docker.env` existent, ne les ouvre pas et ne les copie nulle part ; liste-les simplement pour Brown.
3. **.gitleaks.toml** : supprime l'exclusion du chemin `.env.example`. Remplace-la par `[allowlist] regexes` sur les seules valeurs factices (`replace[-_]?me`, `replace-with-[a-z-]+`, `never-use-in-apps-folder`, `you@example\.com`). Ajoute un test qui échoue si une vraie clé de forme `sk_live_` est collée dans `.env.example`.
4. **docs/TASKS.md**, sois honnête :
   - Décoche **M0-06** et ajoute « staging non créé, décision Brown 2026-10-20 : prod seule jusqu'à M6 », avec l'ADR correspondante dans docs/01-architecture.md.
   - Décoche **M0-07** jusqu'à un premier run vert de `.github/workflows/ci.yml` sur GitHub.
   - Retire le project ref de prod de TASKS.md et garde-le uniquement dans docs/01-architecture.md §6.
5. **Edge Functions** :
   - `supabase/functions/_shared/sentry.ts` importe `../../../packages/shared/src/observability/privacy.ts`, hors du dossier functions.
   - Vérifie avec `supabase functions deploy health --dry-run` (ou `supabase functions serve`) que le bundle l'inclut.
   - Sinon, ajoute un alias `"@renoroute/observability"` dans `supabase/functions/deno.json` ou génère une copie dans `_shared/` avec un test de parité.
6. **i18n lint** (eslint.config.mjs) :
   - Les attributs passent aujourd'hui sans erreur (`accessibilityLabel="Fermer"` n'est pas signalé). Configure `i18next/no-literal-string` pour vérifier aussi `accessibilityLabel`, `accessibilityHint`, `placeholder` et `title`.
   - Ajoute un test « fixture » qui prouve qu'une chaîne en dur dans ces attributs échoue au lint.
   - Supprime le doublon de `fallbackLocale()` : exporte-le une seule fois depuis `apps/mobile/src/lib/i18n.ts`, utilisé par `locale-preference.ts`.
7. **Marque et assets** (apps/mobile) :
   - `app.config.ts` : la couleur du splash et de l'icône adaptative vient de `colors.background` / `colors.primary[700]` dans `src/theme/tokens.ts`, pas `#E6F4FE` ni `#F7F8F6` en dur.
   - Remplace les icônes du template Expo par des icônes RénoRoute dérivées de `apps/landing/assets/logo.svg`.
   - Supprime `apps/mobile/LICENSE`, qui vient du template.
   - `.maestro/app-launches.yaml` : génère `appId` depuis `BRAND.iosBundleId` (script `scripts/run-maestro.ts` passant `-e APP_ID=...`, flow `appId: ${APP_ID}`) et affirme un `testID` plutôt que le nom de marque.
   - Supprime la constante `EAS_PROJECT_ID` dupliquée : garde-la dans `app.config.ts` seulement ou dans une variable d'environnement, pas les deux.
8. **Tokens** : branche `elevation` et `motion` (tokens.ts) là où ils servent, ou documente pourquoi ils restent hors Tailwind. Garde le test de parité avec `apps/landing/tokens.css` (v2).
9. **Écran de démo** : déplace `TokenDemoScreen` vers `src/app/(dev)/tokens.tsx`, accessible seulement si `__DEV__`. `src/app/index.tsx` redirige vers la future route `(auth)`.
10. **PostHog** : ajoute un test qui monte `PostHogProvider` avec une route sensible (`intake`, `photos`, `auth`) et prouve qu'aucun `$screen` ni `$autocapture` ne sort. Utilise `allowAnalyticsEvent` dans `packages/shared/src/observability/privacy.ts`.
11. **Landing** : `apps/landing/.github/workflows/pages.yml` ne tourne pas dans un monorepo. Déplace-le dans `/.github/workflows/landing-pages.yml` avec `paths: ['apps/landing/**']` et `working-directory`, ou documente que la landing vit dans son propre dépôt `renoroute-landing`.
12. **EAS** : dans `eas.json`, passe en production à `"autoIncrement": true` avec `appVersionSource: "remote"`, ou justifie `local`.
13. **Vérification** : `pnpm lint && pnpm typecheck && pnpm test`, puis `supabase start && supabase db lint --local --fail-on error && supabase test db && pnpm db:types && git diff --exit-code packages/shared/src/types/database.types.ts`. Colle les sorties dans la description de PR.

## Phase B — Ajustements produit inspirés d'Enter (lean, sans bloat)
Mets à jour la doc et le schéma, sans construire d'écrans hors milestone :
- **B1. Estimation gratuite immédiate**
  - docs/04-ui-ux.md : après S07 (intake) et avant les photos, un aperçu gratuit (fourchette de coûts et d'économies, et 2–3 mesures prioritaires) avant le paywall S15.
  - Ajoute la tâche **M3-09** dans TASKS.md.
- **B2. Prix de l'énergie modifiables par l'admin**
  - Nouvelle migration `supabase/migrations/0003_energy_prices.sql` : table `energy_prices` avec les colonnes suivantes.

    | Colonne | Contenu |
    |---|---|
    | `id` | identifiant |
    | `fuel` | enum : electricity, heating_oil, propane, wood_pellets, natural_gas |
    | `unit` | unité du prix |
    | `price_cad` | numeric |
    | `effective_from` | date de début |
    | `source_url` | source officielle |
    | `verified_at` | date de vérification |
    | `is_published` | publié ou non |

  - RLS : lecture authentifiée des seules lignes publiées, écriture admin et service_role.
  - Écris des tests pgTAP et regénère les types.
  - Aucune valeur en dur : seed avec `is_published=false` et des montants « à vérifier » par Brown.
  - `packages/shared/src/calc/` (M3-02) lit ces prix.
  - Ajoute l'écran admin à M5-02.
- **B3. Conseiller énergétique dans la boucle**
  - Champs `homes.energy_advisor_status` (none / contacted / pre_evaluation_booked / pre_evaluation_done / post_evaluation_done) et `homes.pre_evaluation_date`.
  - La date « 9 mois » de M5-05 s'en sert.
  - Ajoute à docs/04-ui-ux.md une étape « Trouver un conseiller enregistré » avec un lien officiel. Le lien et les règles du programme Énergie NB sont **à vérifier**, aucun fait inventé.
  - Aucune réservation intégrée.
- **B4. Dossier de subvention prêt à soumettre** (M5-07)
  - Checklist par programme : documents, factures, numéros de modèle, échéances, rappels.
  - Export PDF du plan pour l'entrepreneur et le conseiller.
  - RénoRoute **ne dépose pas** les demandes à la place de l'utilisateur au MVP.
- **B5. Neutralité**
  - docs/01-architecture.md, ADR : pas de commission cachée d'entrepreneurs au MVP. La mise en relation reste en V2 avec divulgation claire.
  - Raison : Finanztip a retiré Enter de ses recommandations en janvier 2026 parce qu'il mélange conseil et intermédiation.
  - Ajoute le principe à AGENTS.md.

## Phase C — Continuer avec M1
Seulement quand la Phase A est verte, enchaîne **M1-01 → M1-08** dans l'ordre de docs/TASKS.md :
- client Supabase avec `expo-secure-store` ;
- gardes `(auth)/(app)/(admin)` ;
- écrans S01–S05 avec les états chargement, erreur, vide et hors ligne ;
- consentements séparés et non pré-cochés ;
- tests pgTAP sur les profils (rôle non modifiable, isolation A/B) ;
- flows Maestro FR et EN pour la connexion OTP.

Ne coche une case que si ses critères d'acceptation sont prouvés par un test ou une sortie de commande.

À la fin, livre :
- la liste des fichiers modifiés ;
- les sorties de lint, typecheck, test et pgTAP ;
- les points « à vérifier » restants pour Brown.
