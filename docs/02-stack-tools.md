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
| **OpenRouter** | Vision, plan, illustration avant/après | Un endpoint ; Auto Router (`openrouter/auto`) choisit le modèle par tâche ; abstraction dans `ai-client.ts` | Paiement à l'usage (tokens + images) — budget cible à définir | Appel direct OpenAI, Anthropic, Google Gemini, xAI, Mistral |
| **Transcription** (optionnel) | Notes vocales → texte | API speech-to-text du fournisseur IA | À l'usage | Whisper auto-hébergé (coût serveur) |
| **Stripe (Checkout + Webhooks + Stripe Tax optionnel)** | Paiement plan 49/99 $ CAD **sur le site** | Hébergé, Apple Pay/Google Pay via navigateur, CAD | Frais par transaction (≈ 2,9 % + 0,30 $ CA pour cartes domestiques — à vérifier) ; Stripe Tax payant | Square, PayPal |
| **RevenueCat (palier gratuit) + IAP Apple/Google** | Paiement plan 49/99 $ CAD **dans l'app** | Conforme §3.1.1 / Play Payments ; un webhook pour les deux stores | Commission magasin (15 % Small Business Apple / 15 % Google premier million — à vérifier) ; palier RC gratuit | StoreKit / Play Billing directs |
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

## Paiement : hybride (décision Brown 2026-10-23, ADR-011)
Voir `05-security.md` §11. Un plan PDF/écran est du **contenu numérique** → IAP obligatoire dans l'app. Le site web peut encaisser autrement.
1. **App iOS/Android** : IAP via RevenueCat (palier gratuit). Edge Function `revenuecat-webhook` (header d'auth, idempotente) pose `plans.unlocked_at`.
2. **Site web** : Stripe Checkout (`create-checkout-session` + `stripe-webhook` signé, idempotent).
3. **Une entitlement** : `plans.unlocked_at` est la source de vérité ; `payments.provider` dit quel magasin a payé.
4. Tests en sandbox/mocks seulement. Aucun compte Stripe, RevenueCat, Apple ou Google n'est créé tant que Brown n'a pas fourni les clés.
5. Ne pas « steerer » l'utilisateur de l'app vers le Checkout web (Apple 3.1.1 / Play) — à vérifier au moment de la fiche store.
