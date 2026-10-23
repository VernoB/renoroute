# TASKS — Backlog ordonné

Légende : **Rôle** `TL` Tech Lead · `MOB` Mobile · `BE` Backend/DB · `AI` IA · `UX` Design · `SEC` Sécurité · `QA` Test · `OPS` DevOps. **Taille** S (≤ ½ jour agent), M (≤ 2 jours), L (> 2 jours, à découper si possible).
Règle : une tâche = une PR. Cocher `[x]` et ajouter `(PR #n)` en fin de ligne. Respecter l'ordre sauf indication « parallélisable ». Décisions de Brown signalées par 🟨.

## M0 — Mise en place
- [x] **M0-01** Initialiser le monorepo pnpm (`apps/mobile`, `packages/shared`, `supabase/`), `tsconfig.base.json` strict, Prettier, ESLint. — `TL` · S (local, pas de PR : dépôt pas encore sous git)
  - AC : `pnpm install`, `pnpm lint`, `pnpm typecheck` passent ; structure = `01-architecture.md` §4 ; `brand.ts` déplacé/importable via `@renoroute/shared`.
- [x] **M0-02** Créer l'app Expo (TypeScript, Expo Router) dans `apps/mobile` ; `app.config.ts` lit `BRAND`. — `MOB` · S (local, pas de PR : dépôt pas encore sous git ; démarrage vérifié par export web, décision Brown 2026-10-19)
  - AC : app démarre sur simulateur iOS + émulateur Android (dev build) ; aucun nom en dur hors `brand.ts`.
- [x] **M0-03** NativeWind + tokens (`theme/tokens.ts` → `tailwind.config.js`) + police Inter. 🟨 NativeWind vs Tamagui — `MOB`/`UX` · M (local, pas de PR : dépôt pas encore sous git ; NativeWind 4.2.7, décision Brown 2026-10-19, ADR-007)
  - AC : écran démo avec tokens couleurs/typo/espacements de `04-ui-ux.md` §5 ; test snapshot.
- [x] **M0-04** i18n : i18next + react-i18next + expo-localization ; `packages/shared/src/i18n/{fr,en}.json` ; détection langue + bascule persistée. — `MOB` · S (local, pas de PR : dépôt pas encore sous git)
  - AC : test « mêmes clés FR/EN » ; `eslint-plugin-i18next` `no-literal-string` actif sur `apps/` ; formats `Intl` fr-CA/en-CA testés.
- [x] **M0-05** Projet Supabase local (`supabase init`, `supabase start`) + appliquer `0001_init.sql` ; génération des types TS. — `BE` · S (local, pas de PR : dépôt pas encore sous git ; `supabase db reset` OK, CLI 2.121.0)
  - AC : `supabase db reset` OK ; `database.types.ts` généré ; script `pnpm db:types`.
- [ ] **M0-06** Créer projets Supabase **staging** et **prod** (région `ca-central-1` si disponible 🟨 à vérifier) ; documenter dans `01-architecture.md` §6. — `OPS` · S — **BLOCKED: needs Brown** (staging non créé, décision Brown 2026-10-20 : prod seule jusqu'à M6, ADR-008 ; région et ref de prod seulement dans `01-architecture.md` §6 ; MFA confirmé par Brown 2026-10-20)
  - AC : région notée ; MFA activé ; clés stockées en secrets, rien dans le repo.
- [x] **M0-07** CI GitHub Actions : lint, typecheck, test, `supabase db lint`, test pgTAP, gitleaks, `pnpm audit`, vérif types BD à jour. Dependabot. — `OPS` · M (premier run vert 2026-10-22 : https://github.com/VernoB/renoroute/actions/runs/39855620130 ; gitleaks 8.28.0 refuse un secret factice en local)
  - AC : PR de test échoue si secret factice ajouté ; actions épinglées par SHA ; permissions minimales.
- [ ] **M0-08** Jest + jest-expo + RNTL ; Deno test pour functions ; Maestro installé avec 1 flow « app launches ». — `QA` · M — **BLOCKED: Maestro CLI and Android emulator not on this machine** (Jest, RNTL et Deno `health` passent en local ; CLI Maestro `cli-2.11.0` et émulateur Android encore absents)
  - AC : `pnpm test` exécute les 3 types ; doc dans README du repo.
- [ ] **M0-09** Sentry (app + functions, `sendDefaultPii: false`) et PostHog (sans PII, autocapture désactivé sur écrans sensibles). — `OPS` · S — **BLOCKED: needs Brown** (code local en place ; tableaux de bord Sentry/PostHog pas encore créés, case non cochée)
  - AC : erreur test visible dans Sentry staging ; événement `app_opened` dans PostHog ; aucune PII.
- [ ] **M0-10** EAS : `eas.json` (development, preview, production), build preview iOS + Android. — `OPS` · M — **BLOCKED: needs Brown** (`eas.json` + projet `f37f3a15-00e6-44a8-9cdd-ae7fe87abd93` ; builds preview pas lancés ; comptes Apple Developer / Expo requis)
  - AC : build interne installable ; variables EAS par environnement.

- [x] **M0-11** Landing page de validation (`apps/landing`) avec les tokens partagés + table `waitlist` (0002). — `MOB`/`UX` · M
  - AC : FR/EN, test de prix ?p=, formulaire configurable, page de confidentialité (brouillon), captures. Reste : brancher Supabase (voir `apps/landing/README.md`).

## M1 — Auth + onboarding
- [x] **M1-01** Client Supabase dans l'app avec `expo-secure-store` ; provider d'auth ; garde de routes `(auth)` / `(app)` / `(admin)`. — `MOB` · M (local, pas de PR)
  - AC : session persistée ; route `(admin)` inaccessible si `role != admin` (test).
- [ ] **M1-02** Écrans S01–S03 (accueil/langue, courriel OTP, vérification). — `MOB` · M (écrans FR/EN et tests RNTL en place ; **BLOCKED: Maestro device run** — flow `email-otp.yaml` non exécuté, dépend de M0-08)
  - AC : FR/EN complets ; a11y labels ; états erreur/chargement ; test RNTL + flow Maestro.
- [ ] **M1-03** Sign in with Apple + Google. — `MOB` · M — **BLOCKED: needs Brown** (écran FR/EN et tests en place, Apple seulement sur iOS ; pas d'essai sur appareil réel, Apple 4.8 TODO(verify), aucun compte développeur créé).
  - AC : fonctionne sur appareils réels (dev build) ; conforme à Apple 4.8 (à vérifier).
- [ ] **M1-04** SMTP custom (Resend ou autre) + modèles de courriel OTP FR/EN. — `OPS` · S — **BLOCKED: needs Brown** (modèles FR/EN dans `supabase/templates/email/` ; aucun compte SMTP, SPF/DKIM non prouvés, un seul corps Auth possible).
  - AC : SPF/DKIM ok ; courriel bilingue selon `locale`.
- [x] **M1-05** S04 Consentements (CGU, IA, marketing séparés, non pré-cochés) → `profiles.consent_*`. — `MOB`/`SEC` · S (local, pas de PR ; version `2026-10-draft`, TODO(verify) jusqu'à M1-06)
  - AC : impossible de générer un plan sans `consent_ai_at` (test) ; versions de CGU enregistrées.
- [ ] **M1-06** Rédiger brouillons Politique de confidentialité + CGU FR/EN (à faire réviser) et les publier sur une page web simple. 🟨 avis professionnel — `SEC` · M — **BLOCKED: needs Brown** (brouillons sur `privacy.html` / `terms.html` ; URL GitHub Pages prouvée 2026-10-22 ; revue professionnelle pas faite)
  - AC : liste des sous-traitants et pays ; durées de conservation ; contact ; URL fonctionnelle.
- [x] **M1-07** S05 Profil (prénom, RTA validée, fournisseur d'électricité). — `MOB` · S (local, pas de PR ; Zod partagé + regex RTA)
  - AC : validation Zod partagée ; RTA regex ; test.
- [x] **M1-08** Tests pgTAP profils : rôle non modifiable, isolation A/B. — `QA`/`BE` · S (pgTAP vert en CI 2026-10-22 : https://github.com/VernoB/renoroute/actions/runs/39855620130 ; `0005_profiles_isolation.sql`)
  - AC : tests verts en CI.

## M2 — Intake maison + photos
- [x] **M2-01** Schémas Zod `HomeInput`, enums partagés (miroir SQL) + test de cohérence avec types générés. — `BE` · S (local, pas de PR)
  - AC : 100 % des enums SQL couverts ; tests.
- [x] **M2-02** S06 Tableau de bord (états vides, prochaine action). — `MOB` · M (charge `homes` + navigation intake/photos/révision)
  - AC : 4 états (aucune maison, intake partiel, plan en aperçu, plan complet) testés.
- [x] **M2-03** S07 Wizard intake 8 étapes, sauvegarde auto (react-hook-form + Zod + TanStack Query). — `MOB` · L (wizard FR/EN + persist `homes` ; flow Maestro `home-intake.yaml` écrit, non exécuté sur appareil)
  - AC : reprise après fermeture de l'app ; « je ne sais pas » partout où pertinent ; FR/EN ; test par étape ; flow Maestro complet.
- [ ] **M2-04** S08/S09 Checklist photos + capture (expo-camera/expo-image-picker), redimension + ré-encodage (EXIF retiré), upload Storage `{uid}/{home_id}/{uuid}.jpg`, file d'envoi avec reprise. — `MOB` · L (picker + ré-encodage + `stripJpegExif` + upload Storage + file hors-ligne ; `pnpm test:exif-device` : ExifTool 13.59 GPS 45.273/-66.063 présent puis absent après strip sur émulateur Android `emulator-5554` / `sdk_gphone64_x86_64` ; chemin iOS Simulator (`simctl`) écrit, non exécutable sur Windows ; iPhone/Android physiques encore TODO(verify))
  - AC : photo stockée sans GPS (test sur iOS + Android réels, outil EXIF) ; ≤ 5 Mo ; permissions traduites ; hors-ligne → reprise.
- [x] **M2-05** Edge Function `analyze-photo` (auth, rate limit, vérif EXIF serveur, vision → `PhotoObservation`, update ligne). — `AI`/`BE` · L (local, pas de PR ; JWT + `consent_ai_at` + update `home_photos` via service role ; Deno mocks : refuse autre user, GPS, `exif_stripped`)
  - AC : Deno tests (mock fournisseur) ; refuse photo d'un autre utilisateur ; `exif_stripped=true` ; log sans contenu.
- [x] **M2-06** S10 Note vocale + `transcribe-voice-note` (optionnel 🟨 MVP ou V1.1). — `MOB`/`AI` · M (local, pas de PR ; carte + enregistrement + JWT `consent_ai_at` ; transcript persisté sur `assessments`)
  - AC : ≤ 2 min ; transcript éditable ; audio supprimé après transcription si décidé.
- [x] **M2-07** S11 Révision + création `assessments` (draft → submit). — `MOB` · S (local, pas de PR ; écran + insert `assessments` draft)
  - AC : bouton désactivé sans consentement IA ; données manquantes signalées.
- [x] **M2-08** Tests pgTAP + Storage : photos isolées, insert sur maison d'autrui refusé, upload hors dossier refusé. — `QA`/`SEC` · S (local, pas de PR ; `0006_photos_isolation.sql`, PASS local)

## M3 — Plan IA
- [x] **M3-01** `measure_benchmarks` : formulaire de saisie des fourchettes NB avec sources (Brown). 🟨 valeurs à fournir par Brown — `BE`/`TL` · M (local, pas de PR ; seed CSV 15 lignes, `is_active=false` jusqu'à vérification Brown)
  - AC : ≥ 10 mesures avec `source_url` + `last_verified_at` ; aucune valeur sans source.
- [x] **M3-02** `packages/shared/src/calc/` : estimations coûts/économies (fourchettes) + tests. — `AI`/`BE` · M (local, pas de PR ; `estimateMeasure` reconnaît `project`/`sqft`/`window`/`unit`/`kW` du CSV et élargit la fourchette si quantité ou prix d'énergie manquent)
  - AC : fonctions pures ; ≥ 90 % couverture ; cas limites (données manquantes → fourchette élargie + `confidence: low`).
- [x] **M3-03** Moteur d'admissibilité `evaluateEligibility` + schéma `RebateConditions`. — `BE` · M (local, pas de PR ; 5 programmes seed §8 + utilité/revenu/pré-évaluation)
  - AC : tests pour chaque programme seed (open/waitlist/announced/closed, utilities, revenu, pré-évaluation).
- [x] **M3-04** `ai-client.ts` (abstraction fournisseur, structured output, timeouts, coût) + prompts `photo_v1`, `plan_v1`. — `AI` · M (décision Brown 2026-10-22 : OpenRouter Auto Router, ADR-010 ; tests mock)
  - AC : changement de fournisseur = 1 fichier ; secrets via `Deno.env` ; tests avec mock.
- [ ] **M3-10** Brancher `visualize-renovation` sur S08/S09/S14 (avant/après si possible). — `MOB`/`AI` · M (client + fonction + carte UI en place ; case ouverte jusqu'à l'upload photo M2-04 et le JWT)
  - AC : consentement IA requis ; FR/EN ; indisponible sans casser le plan ; avis « illustration seulement ».
- [x] **M3-05** Edge Function `generate-plan` (snapshot, calc, règles, LLM, Zod, garde-fous §5, écriture `plans`/`plan_items`, statut). — `AI`/`BE` · L (local, pas de PR ; aperçu = top 2 ; re-submit réutilise ; `ai_cost_usd`)
  - AC : aperçu ne contient que top 2 dans `plans.content` ; rate limit ; idempotent (re-submit ne double pas) ; `ai_cost_usd` enregistré.
- [x] **M3-06** Jeu d'évaluation 25 cas + script `pnpm eval` + rapport. — `AI`/`QA` · M (local, pas de PR ; 25 cas FR/EN déterministes, `eval/reports/2026-10-23-m3-06.md` ; revue qualitative Brown encore requise)
  - AC : métriques `06-ai-pipeline.md` §8 atteintes ; rapport commité dans `eval/reports/`.
- [ ] **M3-07** S12 Génération (progression, polling/Realtime, erreurs). — `MOB` · S
- [ ] **M3-08** S13/S14 Aperçu + plan + détail mesure, avis légal, badges confiance, fourchettes formatées. — `MOB`/`UX` · L
  - AC : items 3+ verrouillés en aperçu ; avis légal visible ; a11y VoiceOver testée ; FR/EN.
- [ ] **M3-09** S07b Aperçu gratuit après l'intake, avant les photos et avant le paywall S15. — `MOB`/`BE` · M
  - AC : fourchette de coûts et d'économies, plus 2 ou 3 mesures prioritaires ; aucun paiement ; montants depuis `packages/shared/src/calc` et `measure_benchmarks` ; avis légal visible ; FR/EN.

## M4 — Paiements
- [x] **M4-00** Paiements hybrides (IAP mobile + Stripe web) consignés en ADR-011. — `TL` · S (décision Brown 2026-10-23)
  - AC : ADR rédigée ; M4-01..04 réécrits (RevenueCat dans l'app, Stripe Checkout sur le site).
- [x] **M4-01** Catalogue produits + `payments.provider` (sandbox/mocks) : `plan_49`, `plan_99` CAD dans `packages/shared`. 🟨 taxes (TVH NB 15 %) et politique de remboursement. — `BE`/`OPS` · S (local, pas de PR)
  - AC : montants déterminés côté serveur ; `provider` ∈ {`stripe`, `revenuecat`} ; aucun compte réel ; clés = placeholders `.env.example`.
- [x] **M4-02** Edge Function `create-checkout-session` (site seulement : prix serveur, `client_reference_id`, URL de retour). — `BE` · M (local, pas de PR)
  - AC : prix client ignoré (test) ; un plan déjà payé ne crée pas de session ; Stripe mocké, pas de clé live.
- [x] **M4-03** Webhooks `stripe-webhook` + `revenuecat-webhook` (signature / header d'auth, idempotence, `payments`, `plans.unlocked_at`, contenu complet, remboursement → re-verrouillage 🟨). — `BE`/`SEC` · M (local, pas de PR)
  - AC : rejouer l'événement = aucun effet double ; auth invalide → 400 ; tests Deno avec payloads fictifs.
- [ ] **M4-04** S15/S16 Paywall : SDK RevenueCat dans l'app (mocks en test) ; Checkout Stripe sur le web ; polling `unlocked_at`. Test de prix via flag PostHog. — `MOB` · M
  - AC : succès/annulation/échec gérés ; Maestro sans carte réelle ; FR/EN ; s'arrêter si une clé store est requise.
- [ ] **M4-05** Reçu FR/EN : Stripe receipts (web) + reçu magasin (IAP). — `OPS` · S — **BLOCKED: needs Brown** (comptes Stripe / stores / RevenueCat)

## M5 — Admin subventions
- [ ] **M5-01** Schéma Zod `RebateProgramInput`/`RebateRuleInput`/`BenchmarkInput`. — `BE` · S
- [ ] **M5-02** Écrans admin A01–A04 dans `(admin)` (Expo web), CRUD, « marquer vérifié aujourd'hui », alerte > N jours. A04 édite `energy_prices` (combustible, unité, prix, source, publication). 🟨 seuil N — `MOB`/`BE` · L
  - AC : non-admin → refus serveur (RLS) et client ; audit_log alimenté (test) ; un prix sans `source_url` reste non publié.
- [ ] **M5-03** `supabase/seed.sql` avec les 5 programmes connus, `is_published=false`. — `BE` · S
  - AC : valeurs = `03-database.md` §8 ; aucune URL devinée (placeholder `TODO-verify`).
- [ ] **M5-04** 🟨 **Brown vérifie chaque programme sur la source officielle**, colle `source_url`, ajuste montants, publie. — `TL` (Brown) · M — **BLOCKED: needs Brown**
- [ ] **M5-05** S17/S18 Checklist subventions + détail programme (statut, source, vérifié le, échéance calculée depuis `homes.pre_evaluation_date` et `completion_window_months`). Étape « Trouver un conseiller enregistré » avec lien officiel `TODO(verify)`, sans réservation dans l'app. — `MOB` · M
  - AC : programme `announced` affiché comme « à venir » ; `closed` non affiché ; FR/EN.
- [ ] **M5-06** Alerte hebdo (GitHub Action cron ou pg_cron) listant programmes non vérifiés depuis N jours → courriel à Brown. — `OPS` · S
- [ ] **M5-07** Dossier prêt à soumettre : checklist par programme (documents, factures, numéros de modèle, échéances, rappels) depuis `rebate_checklist_items`, et export PDF du plan pour l'entrepreneur et le conseiller. — `MOB`/`BE` · M
  - AC : aucune ligne de checklist sans `source_url` publiée ; FR/EN ; le PDF contient l'avis légal ; l'app ne dépose pas la demande.

## M6 — QA, sécurité, lancement bêta
- [ ] **M6-01** S19/S20 Compte : langue, consentements, `export-my-data`, `delete-account` (Storage + auth + anonymisation paiements). — `MOB`/`BE` · M
  - AC : E2E suppression → plus aucune ligne/objet pour l'uid ; export JSON complet.
- [ ] **M6-02** Page web de demande de suppression de compte (exigence Google Play, à vérifier). — `OPS` · S
- [ ] **M6-03** Audit RLS complet + tests pgTAP (7 scénarios) + revue Security Advisor. — `SEC` · M
- [ ] **M6-04** Tests de prompt injection et PII (jeu §8) + revue des logs Sentry/PostHog. — `SEC`/`AI` · M
- [ ] **M6-05** Audit accessibilité (VoiceOver, TalkBack, texte 200 %, contrastes). — `QA`/`UX` · M
- [ ] **M6-06** Régression E2E Maestro : parcours complet S01→S17 FR et EN, iOS + Android. — `QA` · M
- [ ] **M6-07** Sauvegarde + test de restauration. — `OPS` · S
- [ ] **M6-08** Fiches stores FR/EN, captures, privacy labels, Data safety, privacy manifest, textes de permissions. — `OPS`/`UX` · M
- [ ] **M6-09** TestFlight + Google Play test interne/fermé ; 🟨 recruter 10–20 testeurs NB. — `OPS` · M
- [ ] **M6-10** Checklist `05-security.md` §15 et `08-launch-checklist.md` entièrement cochées. — `TL` · S

## Après MVP (aperçu, non détaillé)
- **V2** : portail entrepreneur (`apps/web`), onboarding/vérification entrepreneurs, `match_contractors`, `create-lead` avec consentement, abonnement Stripe entrepreneur, tableau de bord leads, mode sombre, Universal/App Links.
- **V3** : programmes QC/NS/PE/NL, Loi 25, enums utilities, contenus localisés.
