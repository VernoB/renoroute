# AGENTS.md — Règles universelles pour agents de code

Ce fichier est la **source de vérité** des règles. `CLAUDE.md`, `.cursor/rules/project.mdc` et `.github/copilot-instructions.md` en sont des copies abrégées. En cas de conflit, **AGENTS.md gagne**, puis les specs dans `docs/`.

## Contexte
- Produit : app mobile-first bilingue FR/EN de feuille de route de rénovation + subventions pour le Nouveau-Brunswick (nom de travail RénoRoute, défini **uniquement** dans `packages/shared/src/config/brand.ts`).
- Fondateur solo (Brown Verno), budget limité → privilégier simple, gratuit/bon marché, peu de dépendances.
- Docs en français (termes techniques en anglais). **Code, identifiants, commits et noms de fichiers en anglais.**

## Stack (ne pas changer sans ADR dans `docs/01-architecture.md`)
Expo (React Native, TypeScript, Expo Router) · Supabase (Postgres, Auth, Storage, RLS, Edge Functions/Deno) · Zod · i18next/react-i18next · NativeWind · Stripe · Sentry · PostHog · EAS Build/Submit · GitHub Actions · pnpm workspaces.

## Règles non négociables
1. **Mobile-first** : concevoir pour un écran de 360×640 dp d'abord, cibles tactiles ≥ 44×44, une main, connexion lente.
2. **Bilingue** : aucune chaîne visible par l'utilisateur codée en dur. Toujours `t('namespace.key')`. Ajouter la clé dans `fr.json` **et** `en.json` dans la même PR. Formats via `Intl` (`fr-CA`, `en-CA`, devise CAD).
3. **TypeScript strict** (`"strict": true`, `noUncheckedIndexedAccess: true`). Pas de `any` sans commentaire `// eslint-disable-next-line` justifié.
4. **Tests obligatoires** : toute logique (schémas Zod, calculs, règles d'admissibilité, Edge Functions, policies RLS) a des tests. Une PR sans test pour du code logique est refusée.
5. **Aucun secret dans le code.** Seul `.env.example` (valeurs factices) est versionné. Les clés `service_role`, Stripe secret, IA, etc. vivent dans les secrets Supabase/EAS/GitHub. Le client n'a que `EXPO_PUBLIC_*` (URL Supabase + anon key + DSN publics).
6. **IA côté serveur uniquement** : jamais d'appel à un fournisseur IA depuis l'app. Passer par une Edge Function authentifiée, avec rate limit, sortie JSON validée par Zod.
7. **Subventions jamais codées en dur** : toujours lues depuis `rebate_programs` / `rebate_rules` (avec `source_url`, `last_verified_at`). Idem pour les coûts de référence (`measure_benchmarks`).
8. **RLS activé sur toutes les tables** ; toute nouvelle table arrive avec ses policies et un test pgTAP.
9. **Avis légal** (pas une évaluation officielle, non affilié à NB Power) affiché sur chaque écran de plan et dans tout PDF/export.
10. **Vie privée (PIPEDA)** : minimiser les données, supprimer l'EXIF des photos, consentement explicite avant traitement IA, suppression de compte fonctionnelle.
11. **Suivre les specs** de `docs/`. Si une spec est ambiguë ou fausse : proposer la modification de la doc dans la même PR, ne pas improviser silencieusement.
12. **Petites PR** (idéalement < 400 lignes modifiées hors fichiers générés), une tâche `TASKS.md` par PR, titre `[M2-04] Add photo upload screen`.
13. **Mettre à jour `docs/TASKS.md`** : cocher la case de la tâche terminée et noter le numéro de PR.
14. **Ne rien inventer comme fait** (prix, règles de programmes, politiques des stores). Marquer `à vérifier` / `TODO(verify)`.

## Conventions
- Monorepo : `apps/mobile`, `apps/web` (V2), `supabase/`, `packages/shared`. Voir `docs/01-architecture.md`.
- Types/schémas partagés dans `packages/shared` ; le client et les Edge Functions importent les mêmes schémas Zod.
- Migrations SQL numérotées `supabase/migrations/NNNN_description.sql`, jamais modifier une migration déjà fusionnée.
- Commits : Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
- Lint/format : ESLint + Prettier ; `eslint-plugin-i18next` (règle `no-literal-string`) sur `apps/*`.
- Accessibilité : WCAG 2.2 AA (contraste, `accessibilityLabel`, tailles dynamiques).

## Définition de « terminé »
- [ ] Critères d'acceptation de la tâche remplis
- [ ] `pnpm lint && pnpm typecheck && pnpm test` passent en local et en CI
- [ ] Clés i18n FR + EN ajoutées
- [ ] Tests ajoutés/à jour (unitaires, RLS, ou E2E Maestro selon le cas)
- [ ] Doc mise à jour si comportement/schéma changé
- [ ] Case cochée dans `docs/TASKS.md`
- [ ] Aucun secret, aucun `console.log` de données personnelles

## Interdits
- Appeler un LLM/vision depuis le client · utiliser la clé `service_role` dans l'app · désactiver RLS · stocker des photos dans un bucket public · logger des photos, transcriptions, revenus ou adresses complètes · ajouter une dépendance lourde sans justification dans la PR.

## RÈGLE PRIORITAIRE : APP 100 % BILINGUE / TOP-PRIORITY RULE: FULLY BILINGUAL APP
- FR : Tout le produit (app mobile, page web, courriels, notifications, messages d'erreur, plans générés par l'IA, PDF, admin) se développe **en français ET en anglais dès la première ligne de code**. Aucune fonctionnalité n'est « terminée » si elle n'existe pas dans les deux langues, testée dans les deux langues. Le français canadien (fr-CA) et l'anglais canadien (en-CA) ont la même priorité. Langue par défaut = langue de l'appareil, modifiable dans l'app et sauvegardée dans `profiles.locale`. L'IA doit répondre dans la langue choisie par l'utilisateur. Prévoir des textes français environ 30 % plus longs dans les maquettes.
- EN: The whole product (mobile app, website, emails, notifications, error messages, AI-generated plans, PDFs, admin) must be built **in French AND English from the first line of code**. No feature is "done" unless it exists and is tested in both languages. Canadian French (fr-CA) and Canadian English (en-CA) have equal priority. Default language = device language, switchable in-app and saved in `profiles.locale`. The AI must answer in the user's chosen language. Design for French text ~30% longer.
