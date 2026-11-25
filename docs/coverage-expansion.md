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
| `PROFILE_UTILITIES` | NB : les quatre fournisseurs existants. NS : `nova_scotia_power` (migration `0010`), brouillon. Ailleurs : « Je ne sais pas ». La note `profile.utilityUnverified` suit `provinceCoverage().utilitiesVerified`, le même enregistrement que le badge. |
| GPS | Aucune suggestion de province par GPS. Seulement la première lettre du code postal. `X` (NT ou NU) ne devine pas. |

## Soutien

- Plein : `NB` seulement. Le badge « entièrement couvert » exige des programmes publiés et un fournisseur publié. `NS` a des brouillons, donc le badge reste « programmes fédéraux seulement » et la note sur les fournisseurs reste affichée.
- Ailleurs : programmes fédéraux (`jurisdiction = CA`) déjà en base, plus une liste d'attente `coverage_waitlist` (courriel + province + consentement). La Nouvelle-Écosse voit aussi la case, tant que ses lignes ne sont pas publiées.

## Brouillons Nouvelle-Écosse en attente de Brown

Aucun montant, aucune règle, `last_verified_at` vide, `status = draft`, `is_published = false`.

| slug | source | Ce qui manque |
|---|---|---|
| `ns-home-heating-system-rebates` | https://www.efficiencyns.ca/programs-rebates/home-heating-system-rebates | TODO(verify) montants, admissibilité, nom français officiel |
| `ns-program-rebate-finder` | https://www.efficiencyns.ca/program-rebate-finder | TODO(verify) ce n'est qu'un index. Brown découpe les vrais programmes. |

Les autres prix d'énergie NS (mazout, propane, granules, gaz) restent des lignes vides non publiées. L'électricité Nova Scotia Power est dans `0010_ns_power_draft.sql` : 18,324 ¢/kWh (date d'ordre non indiquée dans le PDF, `effective_from` null) et 19,067 ¢/kWh au 2027-01-01, source `https://www.nspower.ca/docs/default-source/regulatory/tariff-book-2026.pdf`, vérifié le 2026-11-22, `is_published = false`. `price_cad` garde les chiffres en cents/kWh. Le calculateur attend des CAD/kWh : ne pas publier avant la conversion. TODO(verify) Brown. Frais mensuels cités par la même source, non stockés : 20,08 $ maintenant, 21,04 $ au 2027-01-01.

Ne rien publier avant la revue Brown (même flux que M5-04).

## Base locale (pas la production)

`0008` et `0009` ne sont pas appliqués au projet Supabase de production.

`supabase migration up --local` échoue sur une base arrêtée à `0005` : `0006_measure_benchmarks_seed.sql` ajoute des valeurs à l'enum `measure_code` et les insère dans la même transaction (`55P04`). Postgres n'autorise l'usage d'une nouvelle valeur qu'après le commit. Un `supabase db reset` frais rencontre le même blocage. Le contournement local, déjà exécuté ici : appliquer les trois `ALTER TYPE ... ADD VALUE` chacun dans sa transaction, puis l'insert, puis enregistrer `0006` / `measure_benchmarks_seed` dans `supabase_migrations.schema_migrations`, puis `supabase migration up --local` pour `0007`–`0009`.

Ensuite : `supabase test db supabase/tests/0009_coverage.sql` et `pnpm db:types`. Le générateur officiel a produit le même `database.types.ts` que la copie déjà commitée.
