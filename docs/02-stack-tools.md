# 02 — Stack et outils

Responsable : **Tech Lead** + **DevOps**. Tous les prix sont des ordres de grandeur connus au moment de la rédaction ; **à vérifier** sur la page de tarifs officielle avant engagement. Les prix de nombreux SaaS sont en **USD**.

| Outil | Rôle | Pourquoi | Palier de coût (à vérifier) | Alternatives |
|---|---|---|---|---|
| **Expo (SDK récent) + React Native + TypeScript** | App iOS/Android (+ web admin) | Un code, outillage mature, pas besoin de Xcode pour builder (EAS), OTA | Gratuit (open source) | Flutter, natif Swift/Kotlin, Ionic/Capacitor |
| **Expo Router** | Navigation par fichiers | Deep links (retour Stripe, magic link), routes typées, web gratuit | Gratuit | React Navigation seul |
| **Supabase** | Postgres, Auth, Storage, RLS, Edge Functions | Backend complet sans serveur ; SQL ; RLS ; région canadienne possible | Free (limites, pause si inactif) ; Pro ≈ 25 USD/mois/org + usage | Firebase, AWS Amplify, Appwrite, PocketBase |
| **Supabase Edge Functions (Deno)** | IA, paiements, suppression compte | Proche de la BD, secrets côté serveur | Inclus (quotas d'invocations) | Cloudflare Workers, Vercel Functions |
| **Zod** | Validation schémas (formulaires, sortie IA, webhooks) | Un schéma = type TS + validation runtime, partagé client/serveur | Gratuit | Valibot, ArkType |
| **i18next + react-i18next + expo-localization** | FR/EN | Standard, pluriels, interpolation, détection langue appareil | Gratuit | Lingui, FormatJS (react-intl) |
| **NativeWind (recommandé)** | Styles (Tailwind pour RN) | Rapide, connu des agents IA, tokens centralisés dans `tailwind.config` | Gratuit | **Tamagui** (plus performant/optimisé, courbe d'apprentissage plus forte), Unistyles, StyleSheet |
| **React Native Reusables** (optionnel) | Composants style shadcn/ui pour NativeWind | Composants copiés dans le repo (pas de lock-in) | Gratuit | gluestack-ui, React Native Paper |
| **TanStack Query** | Cache/requêtes | États chargement/erreur, retry, hors-ligne léger | Gratuit | SWR |
| **react-hook-form + @hookform/resolvers/zod** | Formulaires intake | Performant, intégration Zod | Gratuit | Formik |
| **expo-image-picker / expo-camera / expo-image-manipulator** | Photos, compression, retrait EXIF par ré-encodage | Modules Expo officiels | Gratuit | react-native-vision-camera |
| **expo-audio** (ou expo-av selon SDK — à vérifier) | Notes vocales | Module Expo | Gratuit | — |
| **Fournisseur IA (vision + LLM)** | Analyse photos, plan | Sortie JSON structurée ; choisir selon qualité FR, coût, conditions de données | Paiement à l'usage (tokens) — budget cible à définir | OpenAI, Anthropic, Google Gemini, xAI, Mistral (FR) |
| **Transcription** (optionnel) | Notes vocales → texte | API speech-to-text du fournisseur IA | À l'usage | Whisper auto-hébergé (coût serveur) |
| **Stripe (Checkout + Webhooks + Stripe Tax optionnel)** | Paiement plan 49/99 $ CAD | Hébergé, Apple Pay/Google Pay via navigateur, CAD | Frais par transaction (≈ 2,9 % + 0,30 $ CA pour cartes domestiques — à vérifier) ; Stripe Tax payant | Square, PayPal, IAP Apple/Google (RevenueCat) |
| **EAS Build / Submit / Update** | Builds cloud, soumission stores, OTA | Pas besoin de Mac pour builder iOS | Free (builds limités, file d'attente) ; paliers payants — à vérifier | Builds locaux, Codemagic, Bitrise |
| **Sentry (@sentry/react-native)** | Erreurs/crashs app + Edge Functions | Standard, source maps EAS | Palier gratuit Developer (limité) | Bugsnag, Expo Insights (basique) |
| **PostHog** | Analytics produit, feature flags (tests de prix) | Gratuit généreux, flags pour A/B 49/99 $ | Free jusqu'à un volume d'événements/mois — à vérifier ; hébergement US ou EU (pas de région canadienne connue — à vérifier) | Aptabase, Amplitude, Mixpanel |
| **GitHub + GitHub Actions** | Code, CI | Gratuit pour dépôts privés avec minutes limitées | Free (minutes limitées — à vérifier) | GitLab CI |
| **Dependabot + gitleaks + `pnpm audit`** | Sécurité dépendances/secrets | Gratuits | Gratuit | Snyk (free tier), Socket |
| **Jest + jest-expo + React Native Testing Library** | Tests unitaires/composants | Standard Expo | Gratuit | Vitest (moins adapté RN) |
| **Maestro** | Tests E2E mobiles (YAML) | Simple, fonctionne avec Expo dev builds | CLI gratuit (cloud payant) | Detox |
| **pgTAP (`supabase test db`)** | Tests RLS/SQL | Intégré au CLI Supabase | Gratuit | Tests via supabase-js |
| **Deno test** | Tests Edge Functions | Natif Deno | Gratuit | — |
| **Resend ou SMTP Supabase custom** | Courriels (OTP, reçu) | SMTP par défaut de Supabase très limité en débit → SMTP custom requis en prod (à vérifier) | Free tier | Postmark, Amazon SES |

Les corps OTP FR/EN sont dans `supabase/templates/email/`. Aucun compte SMTP n'est créé dans le dépôt. **SPF/DKIM n'est pas fait.** Les étapes pour Brown sont dans `05-security.md` §3.1.

## Coûts fixes à prévoir (ordre de grandeur, à vérifier)
- Apple Developer Program : 99 USD/an.
- Google Play Console : 25 USD une fois.
- Nom de domaine `.ca` : ~15–30 $/an (registraires variables).
- Supabase Pro (prod) : ≈ 25 USD/mois au lancement public (gratuit pendant dev).
- IA : variable ; viser un **plafond de coût par plan** (voir `06-ai-pipeline.md` §7) et une alerte budget.
- Comptable/avocat : avis sur PIPEDA, conditions d'utilisation, TVH (NB : TVH 15 %). Inscription TPS/TVH obligatoire au-delà du seuil de petit fournisseur (30 000 $ sur 4 trimestres — à vérifier avec un comptable).

## Choix NativeWind vs Tamagui (décision Brown)
- **NativeWind** : recommandé pour un solo + agents IA (syntaxe Tailwind très présente dans les données d'entraînement, docs abondantes). Risque : changements entre versions majeures (v4 → v5) — épingler la version.
- **Tamagui** : meilleur pour performance et web+native partagé (V2), mais config plus complexe.
- **Décision Brown (2026-10-19) : NativeWind**, épinglé à v4.2.7 (stable). La v5 est encore en release candidate. Voir ADR-007 dans `01-architecture.md`.

## Paiement : Stripe vs IAP (décision à valider)
Voir `05-security.md` §11. Résumé : les règles Apple (App Review Guidelines §3.1.1 / §3.1.3(e)) et Google Play (Payments policy) exigent l'achat intégré pour le **contenu numérique** consommé dans l'app, mais permettent d'autres moyens de paiement pour des **biens/services consommés hors de l'app**. Un plan de rénovation personnalisé livré dans l'app peut être jugé « contenu numérique » → **risque de rejet**. Options :
1. Stripe dans l'app (Checkout navigateur) — simple, frais bas, **risque** de rejet.
2. IAP via RevenueCat — conforme, commission store (15 % pour Small Business Program Apple / 15 % Google pour le premier million — à vérifier), plus de travail.
3. Paiement sur le web uniquement (site), app = consultation — conforme mais friction ; attention aux règles anti-incitation (« steering ») — à vérifier pour le Canada.
4. Positionner l'offre payante comme **service réel** (ex. plan + revue par un humain / appel de suivi / mise en relation entrepreneur) → argument plus fort pour §3.1.3(e). **À valider** avant M4.
