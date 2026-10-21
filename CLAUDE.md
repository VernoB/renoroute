# CLAUDE.md

**Lis et applique `AGENTS.md` en entier avant toute action.** C'est la source de vérité.

Rappels clés :
- Specs dans `docs/` (architecture 01, stack 02, BD 03, UI 04, sécurité 05, IA 06, rôles 07, lancement 08). Backlog : `docs/TASKS.md`.
- Mobile-first, chaînes FR/EN via i18next (jamais en dur), TypeScript strict, tests obligatoires.
- Aucun secret dans le code (`.env.example` seulement). IA côté serveur uniquement (Edge Functions).
- Subventions lues depuis la BD (`rebate_programs`, `rebate_rules`), jamais codées en dur.
- Petites PR ; cocher la tâche dans `docs/TASKS.md`.
- Nom de l'app uniquement dans `packages/shared/src/config/brand.ts`.
- Si incertain sur un fait (prix, politique, programme) : écrire `TODO(verify)` et le signaler.

## RÈGLE PRIORITAIRE : APP 100 % BILINGUE / TOP-PRIORITY RULE: FULLY BILINGUAL APP
- FR : Tout le produit (app mobile, page web, courriels, notifications, messages d'erreur, plans générés par l'IA, PDF, admin) se développe **en français ET en anglais dès la première ligne de code**. Aucune fonctionnalité n'est « terminée » si elle n'existe pas dans les deux langues, testée dans les deux langues. Le français canadien (fr-CA) et l'anglais canadien (en-CA) ont la même priorité. Langue par défaut = langue de l'appareil, modifiable dans l'app et sauvegardée dans `profiles.locale`. L'IA doit répondre dans la langue choisie par l'utilisateur. Prévoir des textes français environ 30 % plus longs dans les maquettes.
- EN: The whole product (mobile app, website, emails, notifications, error messages, AI-generated plans, PDFs, admin) must be built **in French AND English from the first line of code**. No feature is "done" unless it exists and is tested in both languages. Canadian French (fr-CA) and Canadian English (en-CA) have equal priority. Default language = device language, switchable in-app and saved in `profiles.locale`. The AI must answer in the user's chosen language. Design for French text ~30% longer.
