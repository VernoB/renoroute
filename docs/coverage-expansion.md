# Couverture Canada (M8-02)

Audit du 2026-11-22. Le code NB déjà publié (programmes, benchmarks, seed M5-04) n'est pas réécrit. Les ajouts NS sont des brouillons non publiés.

## Où le Nouveau-Brunswick était figé

| Endroit | Constat |
|---|---|
| `apps/mobile/src/lib/auth/area-gate.tsx` | Garde de route `(auth)` / `(app)` / `(admin)`. Aucun filtre géographique. Le sélecteur de province est sur S05 (`profile`). |
| `packages/shared/src/i18n` `onboarding.eyebrow` | Était « New Brunswick · Bilingual ». Maintenant « Canada · Bilingual » / « Canada · Bilingue ». |
| `auth.notAffiliated` et `review.disclaimer` | Restent la phrase Énergie NB. L'accueil avant province utilise `legal.notAffiliatedNational`. Un plan NB garde Énergie NB ; un plan NS utilise Nova Scotia Power. |
| `apps/landing/i18n.js` | Le sourcil et « trust.independent » sont nationaux. Les paragraphes qui citent les montants et règles Énergie NB restent, parce que ce sont des faits de programmes NB déjà vérifiés. |
| `homes.province` | Défaut `NB`. L'ancien `check` ne couvrait que NB, NS, PE, NL, QC. Migration `0008` : les 13 codes. |
| `profiles` | Pas de province. `0008` ajoute la colonne nullable. |
| `rebate_programs.jurisdiction` | Texte libre, souvent `NB`, `CA`, `NB-SJ`. |
| `energy_prices` | Pas de province. Les lignes existantes deviennent `NB` par défaut et restent non publiées si elles l'étaient. |
| `packages/shared/src/home/home-input.ts` | `HOME_PROVINCES` ne listait que l'Atlantique et le QC. |
| `PROFILE_UTILITIES` | Seulement les fournisseurs NB. Les autres provinces affichent « Je ne sais pas » et `profile.utilityUnverified`. Pas de nouvel enum inventé. |
| GPS | Aucune suggestion de province par GPS. Seulement la première lettre du code postal. `X` (NT ou NU) ne devine pas. |

## Soutien

- Plein : `NB` (comportement des programmes publiés inchangé) et `NS` (brouillons seulement, invisibles tant que `is_published` est faux).
- Ailleurs : programmes fédéraux (`jurisdiction = CA`) déjà en base, plus une liste d'attente `coverage_waitlist` (courriel + province + consentement).

## Brouillons Nouvelle-Écosse en attente de Brown

Aucun montant, aucune règle, `last_verified_at` vide, `status = draft`, `is_published = false`.

| slug | source | Ce qui manque |
|---|---|---|
| `ns-home-heating-system-rebates` | https://www.efficiencyns.ca/programs-rebates/home-heating-system-rebates | TODO(verify) montants, admissibilité, nom français officiel |
| `ns-program-rebate-finder` | https://www.efficiencyns.ca/program-rebate-finder | TODO(verify) ce n'est qu'un index. Brown découpe les vrais programmes. |

Les prix d'énergie NS sont des lignes `energy_prices` non publiées, unité `TODO(verify)`, prix vide, sans URL. Le nom du fournisseur n'est pas écrit comme un tarif.

Ne rien publier avant la revue Brown (même flux que M5-04).

## Base locale (pas la production)

`0008` et `0009` ne sont pas appliqués au projet Supabase de production.

`supabase migration up --local` échoue sur une base arrêtée à `0005` : `0006_measure_benchmarks_seed.sql` ajoute des valeurs à l'enum `measure_code` et les insère dans la même transaction (`55P04`). Postgres n'autorise l'usage d'une nouvelle valeur qu'après le commit. Un `supabase db reset` frais rencontre le même blocage. Le contournement local, déjà exécuté ici : appliquer les trois `ALTER TYPE ... ADD VALUE` chacun dans sa transaction, puis l'insert, puis enregistrer `0006` / `measure_benchmarks_seed` dans `supabase_migrations.schema_migrations`, puis `supabase migration up --local` pour `0007`–`0009`.

Ensuite : `supabase test db supabase/tests/0009_coverage.sql` et `pnpm db:types`. Le générateur officiel a produit le même `database.types.ts` que la copie déjà commitée.
