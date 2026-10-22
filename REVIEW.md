# Revue de code RénoRoute (M0), 2026-10-20

Source : `/workspace/uploads/rr-review.zip`, sans node_modules, lockfile, research ni screenshots. Les chemins de l'archive utilisaient des barres obliques inverses (zip Windows) ; l'extraction a été normalisée.

## Verdict

M0 est solide et dans l'esprit du spec :

- TypeScript strict (`noUncheckedIndexedAccess`) ;
- i18n FR/EN partagé ;
- BRAND comme source unique ;
- tokens v2 identiques au CSS de la landing, vérifiés par un test ;
- Sentry et PostHog sans PII ;
- actions CI épinglées par SHA ;
- gitleaks ;
- pnpm audit avec liste d'exceptions documentée ;
- test RLS.

Il n'y a aucun bloquant critique. En revanche, plusieurs cases sont cochées alors que le travail n'a pas été vérifié pour de vrai. Il y a aussi quelques défauts de configuration et de marque.

## Exécution réelle dans la box (Node 22.18, pnpm 10.18.3, Deno 2.9.7)

| Étape                                        | Résultat                                                         |
| -------------------------------------------- | ---------------------------------------------------------------- |
| `pnpm install` (sans lockfile)               | PASS                                                             |
| `pnpm lint` (eslint + prettier)              | PASS                                                             |
| `pnpm typecheck` (shared + mobile)           | PASS                                                             |
| Tests shared (node:test)                     | PASS, 19/19                                                      |
| Tests mobile (node:test + Jest/RNTL)         | PASS, 7/7 + 2 suites, 1 snapshot                                 |
| `deno test supabase/functions`               | PASS, 3/3                                                        |
| `check-audit.ts`                             | PASS (aucun nouvel avis high ou critical)                        |
| Supabase local, `db lint`, pgTAP, `db:types` | NON EXÉCUTÉ (pas de Docker ni de CLI Supabase dans la box)       |
| Maestro                                      | NON EXÉCUTÉ (ni CLI ni émulateur, le script le saute proprement) |
| Workflow CI GitHub                           | JAMAIS EXÉCUTÉ (le projet n'est pas un dépôt git)                |

## Tâches M0

| Tâche                        | Coché | Constat                                                                                                                                                                                                    |
| ---------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M0-01 monorepo               | x     | OK.                                                                                                                                                                                                        |
| M0-02 Expo + BRAND           | x     | OK : `app.config.ts` lit BRAND. Les icônes et l'icône adaptative sont celles du template Expo (`#E6F4FE`). `LICENSE` vient du template. La couleur du splash est codée en dur au lieu de venir des tokens. |
| M0-03 NativeWind + tokens    | x     | OK : tokens = landing v2, avec test. `elevation` et `motion` ne sont pas branchés dans Tailwind.                                                                                                           |
| M0-04 i18n                   | x     | OK : détection de la langue et bascule persistée. `fallbackLocale()` est dupliqué dans `i18n.ts` et `locale-preference.ts`.                                                                                |
| M0-05 Supabase local + types | x     | Plausible : 0001 et 0002 sont identiques au spec et les types sont présents (1222 lignes). Non revérifiable ici.                                                                                           |
| M0-06 staging + prod         | x     | **Coché à tort** : le staging n'est pas créé. Il faut décocher la case ou ajouter une décision ADR « prod seule jusqu'à M6 ».                                                                              |
| M0-07 CI                     | x     | **Coché à tort** : le workflow n'a jamais tourné. `--frozen-lockfile` exige le lockfile versionné.                                                                                                         |
| M0-08 tests + Maestro        | [ ]   | État correct : Jest, RNTL et Deno OK, Maestro absent. Le flow n'affirme que le nom de marque.                                                                                                              |
| M0-09 Sentry/PostHog         | [ ]   | Code OK. Aucun test ne vérifie que les écrans sensibles sont exclus de l'autocapture côté `PostHogProvider`.                                                                                               |
| M0-10 EAS                    | [ ]   | `appVersionSource: remote` et `autoIncrement` en production. Les builds preview ne sont pas lancés.                                                                                                        |
| M0-11 landing                | x     | OK. `apps/landing/.github/workflows/pages.yml` ne s'exécutera **pas** dans un monorepo, car GitHub ne lit que `/.github/workflows`.                                                                        |

## Règles d'AGENTS.md

| Règle                | Constat                                                                                                                                                                                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Strict TS            | OK.                                                                                                                                                                                                                                                            |
| Aucune chaîne en dur | Partiel. `i18next/no-literal-string` est en `markupOnly`, ce qui laisse passer les **attributs** (`accessibilityLabel="Fermer"` n'est pas signalé, testé). L'écran de démo affiche des noms de tokens en dur (acceptable pour un écran développeur seulement). |
| Tests                | OK.                                                                                                                                                                                                                                                            |
| Aucun secret         | OK.                                                                                                                                                                                                                                                            |
| IA côté serveur      | Rien encore.                                                                                                                                                                                                                                                   |
| BRAND source unique  | Deux fuites : `appId: ca.renoroute.app` dans `.maestro/app-launches.yaml`, et `EAS_PROJECT_ID` dupliqué dans `app.config.ts` et `.env.example` (ce n'est pas un secret).                                                                                       |
| Écran d'accueil      | `index.tsx` est une démo de tokens. Il faut le déplacer sous une route développeur (`__DEV__`) avant M1.                                                                                                                                                       |

## Sécurité

| Sévérité         | Constat                                                                                                                                                                                                                                                                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| —                | Aucun secret réel trouvé (scan regex des clés `sk_`, `eyJ…`, `phc_`, mots de passe).                                                                                                                                                                                                                                                     |
| —                | `.env.example` ne contient que des valeurs factices.                                                                                                                                                                                                                                                                                     |
| —                | `supabase/.temp` et `docker.env` sont absents de l'archive. **Les vérifier sur le PC de Brown**, car `.temp` contient le project-ref et parfois des jetons de pooler ; il est déjà dans `.gitignore`.                                                                                                                                    |
| Moyen            | `.gitleaks.toml` exclut tout le fichier `.env.example` : une vraie clé collée là ne serait jamais détectée. Il faut le remplacer par des regex ciblées sur les valeurs factices (`replace`, `_replace_me`, `never-use`).                                                                                                                 |
| Moyen            | `supabase/functions/_shared/sentry.ts` importe `../../../packages/shared/...`, hors du dossier functions. Le bundler de `supabase functions deploy` risque de ne pas l'inclure (**à vérifier**, `supabase functions deploy health --dry-run` ou déploiement staging). Alternative : un import map dans `deno.json` ou une copie générée. |
| Faible           | `.gitignore` : ajouter `docker.env`, `supabase/.env*`, `*.env.local`, `.maestro/` (sorties), `apps/landing/screenshots/` si ces captures ne doivent pas être versionnées. `.env.*` est déjà couvert.                                                                                                                                     |
| Faible           | Le prod ref `ujqqgsxpnwrqyqsosdnt` est écrit dans TASKS.md. Ce n'est pas un secret, mais il faut éviter de le multiplier.                                                                                                                                                                                                                |
| Bloquant process | Le projet n'est **pas un dépôt git** : pas de PR, pas de CI, pas d'historique pour gitleaks. Faire `git init`, versionner le lockfile, un premier commit, ouvrir un dépôt **privé**, puis un `gitleaks detect` local avant le premier push.                                                                                              |

## Enter (enter.de) vs RénoRoute

Comment Enter fonctionne, d'après ses pages publiques et la presse (2026) :

1. Inscription gratuite, puis une **estimation immédiate** du besoin de rénovation.
2. Visite sur place d'un **expert en efficacité énergétique certifié** (liste dena) et jumeau numérique ou modèle 3D.
3. Feuille de route de rénovation (iSFP) : économies par mesure, subventions, amortissement, avec un bonus de 5 % de subvention.
4. **Devis d'artisans** : 3 offres régionales, gratuites pour les clients.
5. Enter **monte les dossiers de subvention** (BAFA/KfW, TPB-ID avant le début des travaux), avec une « garantie de subvention ».
6. Partenariats B2B2C, par exemple avec l'assureur HUK-Coburg.
7. Risque de réputation : depuis janvier 2026, Finanztip ne recommande plus Enter parce qu'il mélange conseil et intermédiation avec les artisans contre commission.

Écarts qui comptent pour un MVP lean :

1. **Valeur immédiate avant le paiement** : une estimation gratuite après l'intake (fourchette et 2–3 mesures principales) avant le paywall. Le spec a déjà l'« aperçu » S13 : le rendre accessible tôt, sans attendre les photos.
2. **Conseiller énergétique dans la boucle** : au N.-B., les remises passent par une évaluation EnerGuide d'un conseiller enregistré (avant et après, délais de 9 mois déjà dans le spec). Ajouter une étape « Réserver/contacter un conseiller » (liste, lien, statut de la date d'évaluation), sans intégration lourde. Les détails exacts du programme sont **à vérifier** sur la source officielle.
3. **Dossier de subvention** : Enter dépose les demandes à la place du client. Pour le MVP, ne pas déposer à sa place, mais générer un **dossier prêt à soumettre** : documents à garder, factures, numéros, échéances, rappels.
4. **Mise en relation avec les entrepreneurs** : laisser de côté au MVP (V2, déjà prévu). Ajouter seulement « exporter le plan (PDF) à donner aux entrepreneurs » et un intérêt opt-in. Garder la **neutralité** (pas de commission cachée) comme argument face à la critique faite à Enter.
5. **Prix de l'énergie** : les économies doivent s'appuyer sur des tarifs Énergie NB et des prix de mazout/propane provenant d'une table modifiable par l'admin, avec source et date. Même règle que les remises : jamais codé en dur.
6. Partenariats (banques, assureurs, municipalités) : après la bêta seulement.
7. Hors MVP : jumeau 3D, visite sur place, garantie de subvention.
