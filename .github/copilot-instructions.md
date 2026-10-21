# Instructions GitHub Copilot — RénoRoute

Source de vérité : `AGENTS.md` à la racine. Specs : `docs/`. Backlog : `docs/TASKS.md`.

Règles :
1. Mobile-first (Expo / React Native / Expo Router, TypeScript strict).
2. Aucune chaîne visible en dur : utiliser `t('namespace.key')` (i18next) et ajouter la clé en FR **et** EN dans `packages/shared/src/i18n/`.
3. Tests requis pour toute logique (Jest + React Native Testing Library, Deno test pour Edge Functions, pgTAP pour RLS).
4. Aucun secret dans le code ; seulement `.env.example`. Côté client : variables `EXPO_PUBLIC_*` uniquement.
5. Appels IA uniquement dans `supabase/functions/*` (jamais dans `apps/*`), sortie validée avec les schémas Zod de `packages/shared`.
6. Données de subventions lues depuis `rebate_programs` / `rebate_rules`, jamais codées en dur.
7. RLS activé sur toute nouvelle table + policies + tests.
8. Afficher l'avis légal (non officiel, non affilié à NB Power) sur les écrans de plan.
9. Petites PR ; mettre à jour la case dans `docs/TASKS.md`.
10. Identifiants et commits en anglais ; docs en français. Marquer toute incertitude `TODO(verify)`.

## RÈGLE PRIORITAIRE : APP 100 % BILINGUE / TOP-PRIORITY RULE: FULLY BILINGUAL APP
- FR : Tout le produit (app mobile, page web, courriels, notifications, messages d'erreur, plans générés par l'IA, PDF, admin) se développe **en français ET en anglais dès la première ligne de code**. Aucune fonctionnalité n'est « terminée » si elle n'existe pas dans les deux langues, testée dans les deux langues. Le français canadien (fr-CA) et l'anglais canadien (en-CA) ont la même priorité. Langue par défaut = langue de l'appareil, modifiable dans l'app et sauvegardée dans `profiles.locale`. L'IA doit répondre dans la langue choisie par l'utilisateur. Prévoir des textes français environ 30 % plus longs dans les maquettes.
- EN: The whole product (mobile app, website, emails, notifications, error messages, AI-generated plans, PDFs, admin) must be built **in French AND English from the first line of code**. No feature is "done" unless it exists and is tested in both languages. Canadian French (fr-CA) and Canadian English (en-CA) have equal priority. Default language = device language, switchable in-app and saved in `profiles.locale`. The AI must answer in the user's chosen language. Design for French text ~30% longer.
