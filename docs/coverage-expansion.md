# Couverture Canada (M8-02)

Audit du 2026-11-22. Le code NB déjà publié (programmes, benchmarks, seed M5-04) n'est pas réécrit. Brown a approuvé la recherche `docs/research/ns-rebates-research-2026-11-22.md` le 2026-11-24. La migration `0011_publish_ns.sql` publie les programmes néo-écossais ouverts et les deux tarifs Nova Scotia Power. Elle n'est pas appliquée au projet Supabase de production.

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
| `PROFILE_UTILITIES` | NB : les quatre fournisseurs existants. NS : `nova_scotia_power`, publié dans `0011` (les chiffres restent ceux de `0010`). Ailleurs : « Je ne sais pas ». La note `profile.utilityUnverified` suit `provinceCoverage().utilitiesVerified`, le même enregistrement que le badge. |
| GPS | Aucune suggestion de province par GPS. Seulement la première lettre du code postal. `X` (NT ou NU) ne devine pas. |

## Soutien

- Plein : `NB` et `NS`. Le badge « Entièrement couvert » / « Fully covered » et la note sur les fournisseurs lisent le même `provinceCoverage()`. La note n'apparaît que si `utilitiesVerified` est faux. Le bouton « Écrivez-moi quand cette province sera pleinement soutenue » n'apparaît que si le niveau n'est pas `full`.
- Ailleurs : programmes fédéraux (`jurisdiction = CA`) déjà en base, plus une liste d'attente `coverage_waitlist` (courriel + province + consentement).

## Nouvelle-Écosse publiée (`0011`, revue Brown 2026-11-24)

Programmes **ouverts et publiés** : évaluation énergétique, remise pour revenu modéré, HomeWarming, installation gratuite de produits, remises instantanées, communautés afro-néo-écossaises, Solar City, HalifACT, Programme d'aide au chauffage (400 $, aide à la facture, pas des travaux).

**Non publié, quoique ouvert sur la page ENS** : EnergyForward New Homes (construction neuve seulement, hors rénovation).

**Fermés, non publiés** : Home Heating System Rebates (31 décembre 2025), Oil to Heat Pump NS (2 juillet 2026), Subvention canadienne pour des maisons plus vertes, SolarHomes, MHEEP, Clean Energy Financing, recyclage d'électroménagers. Le prêt Greener Homes du seed M5-04 reste fermé et non publié. **Eco Shift** reste `paused`, non publié.

Le Programme national de remise pour les thermopompes reste `announced` (portail au début de 2027). `name_fr_is_translation` est faux pour ce nom officiel, et vrai quand la recherche dit qu'aucune page française officielle n'existe (ENS, Halifax).

L'index `ns-program-rebate-finder` reste un brouillon non publié.

Nova Scotia Power, chiffres inchangés de `0010` : 18,324 ¢/kWh (`effective_from` null, date de l'ordonnance non indiquée) et 19,067 ¢/kWh au 2027-01-01. Source `https://www.nspower.ca/docs/default-source/regulatory/tariff-book-2026.pdf`, vérifié le 2026-11-22, `is_published = true`. `price_cad` reste en cents/kWh. `priceAsCad` divise par 100 au moment du calcul. Frais mensuels non stockés : 20,08 $ maintenant, 21,04 $ au 2027-01-01. Mazout, propane, granules et gaz NS restent des lignes vides non publiées.

## Commande locale (pas la production)

Ne pas lancer ceci contre le projet Supabase de production. Sur la base locale :

```bash
supabase migration up --local
```

Si la base locale est arrêtée à `0005`, le blocage `0006` décrit plus bas s'applique encore. Un `supabase db reset` frais rencontre le même blocage `55P04`. Le contournement déjà documenté (trois `ALTER TYPE` puis l'insert, puis l'enregistrement de `0006`) reste nécessaire avant `0011`.

`supabase test db` applique les migrations sur la base de test locale, pas sur la production.

## Blocage `0006` (base locale)

`supabase migration up --local` échoue sur une base arrêtée à `0005` : `0006_measure_benchmarks_seed.sql` ajoute des valeurs à l'enum `measure_code` et les insère dans la même transaction (`55P04`). Postgres n'autorise l'usage d'une nouvelle valeur qu'après le commit. Un `supabase db reset` frais rencontre le même blocage. Le contournement local : appliquer les trois `ALTER TYPE ... ADD VALUE` chacun dans sa transaction, puis l'insert, puis enregistrer `0006` / `measure_benchmarks_seed` dans `supabase_migrations.schema_migrations`, puis `supabase migration up --local` pour `0007`–`0011`.

La colonne `name_fr_is_translation` est ajoutée dans `0011`. `database.types.ts` a été mis à jour à la main pour cette colonne. Ne pas lancer `pnpm db:types` contre la production.
