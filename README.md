# RénoRoute — Pack de planification pour agents de code

> **Nom de travail :** RénoRoute (peut changer). Le nom, le slug et les identifiants de bundle vivent **à un seul endroit** : `packages/shared/src/config/brand.ts`. Aucun autre fichier ne doit coder le nom en dur (les docs disent « RénoRoute » par commodité).

## 1. Vision

RénoRoute est une application **mobile-first et bilingue (FR/EN)** qui aide les propriétaires du **Nouveau-Brunswick** à savoir **quoi rénover, dans quel ordre, à quel coût approximatif, et avec quelles subventions**. Inspiration : Enter.de (Allemagne) — feuille de route énergétique personnalisée + accès à des entrepreneurs.

Parcours principal :
1. Le propriétaire crée un compte (FR ou EN).
2. Il décrit sa maison : année, type, chauffage, superficie, factures d'énergie, **photos** (pièces, fenêtres, entretoit, équipement de chauffage), **notes vocales** (optionnel).
3. L'IA (côté serveur seulement) produit un **plan priorisé** : quoi faire d'abord, fourchettes de coûts, fourchettes d'économies d'énergie.
4. Le plan indique les **programmes de subventions ouverts et potentiellement admissibles** (données dans une table éditable par l'admin, avec `source_url` + `last_verified_at` — **jamais codées en dur**).
5. Le plan complet est **payant** (tests de prix : 49 $ / 99 $ CAD).
6. Plus tard : mise en relation avec des **entrepreneurs locaux vérifiés** (frais de référence ou abonnement entrepreneur).

**Avis obligatoire (partout où un plan est affiché) :** « Ce plan n'est pas une évaluation énergétique officielle. RénoRoute n'est pas affilié à Énergie NB / NB Power ni à aucun gouvernement. Vérifiez toujours l'admissibilité auprès du programme officiel. »

## 2. Phases

| Phase | Portée | Cible |
|---|---|---|
| **MVP** | App mobile propriétaire (iOS/Android), onboarding + intake maison + photos, génération de plan IA, paiement Stripe, checklist subventions, table admin des subventions | Bêta fermée NB |
| **V2** | Portail entrepreneur (tableau de bord des leads), matching propriétaire ↔ entrepreneur, version web (`apps/web`) | Lancement public NB |
| **V3** | Expansion Québec + provinces atlantiques (NS, PEI, NL) : tables de programmes par juridiction, contenu localisé | Croissance |

## 3. Comment utiliser ce pack

1. Lire `README.md` puis `AGENTS.md` (règles universelles).
2. Ouvrir le dépôt dans votre outil : **Claude Code** lit `CLAUDE.md`, **Cursor** lit `.cursor/rules/project.mdc`, **Copilot** lit `.github/copilot-instructions.md`, **Codex** lit `AGENTS.md`. Tous renvoient aux mêmes règles.
3. Choisir une tâche dans `docs/TASKS.md` (dans l'ordre des milestones M0 → M6).
4. Copier le **prompt de rôle** correspondant dans `docs/07-team-roles.md` et le donner à l'agent avec l'ID de tâche (ex. « Exécute la tâche M2-04 »).
5. L'agent livre une **petite PR**, coche la case dans `docs/TASKS.md`, met à jour la doc concernée.
6. Vous (Brown) révisez et fusionnez. Les points marqués **« à vérifier »** sont des décisions ou faits à confirmer avant le lancement.

## 4. Carte des dossiers (état actuel du pack)

```
renoroute-project/
├── README.md                     # Ce fichier
├── AGENTS.md                     # Règles universelles pour tous les agents
├── CLAUDE.md                     # Pointeur vers AGENTS.md (Claude Code)
├── .cursor/rules/project.mdc     # Règles Cursor (mêmes règles clés)
├── .github/copilot-instructions.md
├── .env.example                  # Variables d'environnement (aucun secret réel)
├── .gitignore
├── package.json                  # scripts racine : lint, typecheck, test
├── pnpm-workspace.yaml           # apps/* + packages/* ; nodeLinker hoisted
├── pnpm-lock.yaml
├── tsconfig.base.json            # TypeScript strict
├── eslint.config.mjs
├── .prettierrc.json
├── docs/
│   ├── 01-architecture.md        # Architecture, diagramme, monorepo
│   ├── 02-stack-tools.md         # Outils, justification, coûts, alternatives
│   ├── 03-database.md            # Schéma Postgres + RLS
│   ├── 04-ui-ux.md               # Écrans, flux, wireframes, tokens, a11y
│   ├── 05-security.md            # Modèle de menace, PIPEDA, checklist
│   ├── 06-ai-pipeline.md         # Prompts, schémas JSON, garde-fous, coûts
│   ├── 07-team-roles.md          # Rôles + prompts prêts à coller
│   ├── 08-launch-checklist.md    # Checklist de lancement bêta
│   └── TASKS.md                  # Backlog ordonné avec cases à cocher
├── supabase/
│   └── migrations/0001_init.sql  # Migration initiale (schéma + RLS + storage)
├── apps/
│   ├── landing/                  # M0-11, page de validation (hors workspace TS)
│   └── mobile/                   # paquet @renoroute/mobile (app Expo : M0-02)
└── packages/shared/              # @renoroute/shared — brand.ts est le SEUL nom
```

Structure cible complète du monorepo : voir `docs/01-architecture.md`.

## Démarrage local

```bash
corepack pnpm install
corepack pnpm exec supabase start
corepack pnpm db:types
corepack pnpm --filter @renoroute/mobile start
```

Docker Desktop doit tourner avant `supabase start`. `corepack pnpm exec supabase db reset` réapplique les migrations. `corepack pnpm db:types` régénère `packages/shared/src/types/database.types.ts` depuis la base locale.

`corepack pnpm lint`, `corepack pnpm typecheck` et `corepack pnpm test` lancent les vérifications du monorepo. `pnpm test` enchaîne trois suites : Jest et React Native Testing Library (`test:unit`), Deno pour les Edge Functions (`test:deno`, fonction `health`), et Maestro (`test:maestro`). Le fichier `apps/mobile/.maestro/app-launches.yaml` est toujours vérifié. Le lancement sur appareil attend le CLI Maestro `cli-2.11.0` et un émulateur Android en ligne ; sans eux, cette étape s'arrête sans échouer.

Le simulateur iOS exige macOS. L'émulateur Android vient d'Android Studio stable (`Google.AndroidStudio`, pas Beta ni Canary). Les icônes viennent du logo de la landing (`apps/landing/assets/logo.svg`) et les couleurs de splash des tokens.

Sentry et PostHog restent éteints tant que `EXPO_PUBLIC_SENTRY_DSN` et `EXPO_PUBLIC_POSTHOG_KEY` sont vides. Les Edge Functions lisent le secret `SENTRY_DSN`. `apps/mobile/eas.json` a les profils `development`, `preview` et `production`, liés au projet Expo `f37f3a15-00e6-44a8-9cdd-ae7fe87abd93`. Les builds preview ne partent qu'après connexion à Expo (et à Apple pour iOS).

## 5. Décisions ouvertes (résumé — détail dans les docs)

- Paiement : Stripe in-app vs règles IAP Apple/Google (**à vérifier**, voir `05-security.md` §11 et `02-stack-tools.md`).
- Prix : 49 $ vs 99 $ (A/B ou deux paliers), et ce qui est gratuit dans l'aperçu.
- UI : NativeWind (recommandé) vs Tamagui.
- Fournisseur IA (OpenAI / Anthropic / Google / autre) — abstraction prévue.
- Nom final de l'app + nom de domaine + entité légale (entreprise individuelle vs société NB).
- Région Supabase `ca-central-1` (**à vérifier** à la création du projet).
