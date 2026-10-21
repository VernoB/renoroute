# RénoRoute — landing page de validation

Site statique (HTML/CSS/JS, aucune dépendance) qui reprend **le même design system que l'app mobile** (`docs/04-ui-ux.md` §5) : `tokens.css` est le miroir exact des tokens mobiles.

## Fichiers
| Fichier | Rôle |
|---|---|
| `index.html`, `privacy.html` | Pages générées (FR par défaut en statique, bascule FR/EN en JS) — **ne pas éditer à la main** |
| `src/*.template.html` | Gabarits source |
| `i18n.js` | Toutes les chaînes FR + EN (même règle que l'app : aucune chaîne en dur) |
| `config.js` | **Seul point de configuration** : nom (miroir de `packages/shared/src/config/brand.ts`), courriel de contact, URL du site, prix testés, **endpoint du formulaire** |
| `tokens.css` | Design tokens (miroir de l'app) · `styles.css` composants |
| `app.js` | Langue, test de prix `?p=49` / `?p=99`, formulaire, accordéon FAQ (fonctionne sans GSAP) |
| `motion.js` + `assets/vendor/gsap.min.js`, `ScrollTrigger.min.js` | Animations GSAP 3.15 auto-hébergées (licence standard sans frais). Désactivées si « Réduire les animations ». Voir `docs/landing-design-notes.md` |
| `assets/logo.svg`, `favicon.svg`, `og-image.png` (+ `.b64` pour le déploiement) | Identité visuelle, Open Graph |
| `tools/render.mjs` | Mini build optionnel : `node tools/render.mjs` (régénère les HTML + vérifie la parité des clés FR/EN) |
| `tools/shoot.mjs`, `tools/og-image.html` | Captures Playwright + génération de l'image OG |
| `.github/workflows/pages.yml` | Déploiement GitHub Pages (Actions) |

## Paramètres d'URL
`?lang=fr|en` · `?p=49|99` · `utm_source`, `utm_campaign`, `utm_content` (enregistrés avec l'inscription).

## Formulaire : comment il enregistre
`config.js → form.mode = 'auto'` choisit dans l'ordre :
1. **Supabase** (recommandé, gratuit) : renseigner `supabaseUrl` + `supabaseAnonKey` (clé publique). Les inscriptions vont dans la table `waitlist` (`supabase/migrations/0002_waitlist.sql` : insertion seulement pour le public, lecture admin seulement, unicité du courriel, consentement obligatoire).
2. **postUrl** : tout endpoint qui accepte un POST de formulaire.
3. **mailto** (repli) : si `contactEmail` est une vraie adresse, ouvre l'app courriel du visiteur, déjà rempli.
4. **none** : rien de configuré, la page dit clairement que les inscriptions ne sont pas encore ouvertes (**ne simule jamais un succès**).

Anti-spam : champ piège (honeypot) + contraintes BD. Ajouter Turnstile/hCaptcha via une Edge Function si du spam apparaît.

## Activer Supabase pour le formulaire
1. Créer le projet Supabase (région Canada si offerte), puis appliquer `0001_init.sql` et `0002_waitlist.sql` (`supabase db push` ou éditeur SQL).
2. Copier l'URL du projet + la clé anon/publishable dans `config.js`, `node tools/render.mjs`, puis commit/push.
3. Faire une inscription test, vérifier la ligne dans Table Editor → `waitlist`.

## Accessibilité
Lien d'évitement, focus visible, labels, erreurs annoncées (`aria-live`), cibles ≥ 44 px, contrastes des tokens AA, `prefers-reduced-motion`, statut jamais transmis par la couleur seule.
