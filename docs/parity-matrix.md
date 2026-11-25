# Parité mobile / web

Même code Expo (`apps/mobile`) pour iOS, Android et le web (`expo start --web`). `apps/landing` est le site vitrine, pas l'app.

| Fonction | Mobile | Web | Tests | Notes |
|---|---|---|---|---|
| Accueil / onboarding animé | ✅ | ✅ | RNTL + Maestro `onboarding.yaml` | Reduce motion : fondu court. Vidéo Android dans `docs/media/`. |
| Connexion sociale + OTP + confiance | ✅ | ✅ | RNTL FR/EN, `otp-code.test.ts`, Playwright `e2e/web-auth.spec.ts` | Apple seulement sur iOS (guideline 4.8). Google, Facebook et TikTok : logos locaux et couleurs officielles. Carte de confiance avec icônes. Le bandeau décoratif de la connexion utilise les mêmes formes en styles explicites sur le web et sur mobile. Le test navigateur reste hors ligne (clé anon `replace-e2e`) pour ne pas créer de compte. |
| Consentements non pré-cochés | ✅ | ✅ | RNTL | Feuille « en savoir plus » vers `privacy.html` / `terms.html`. |
| Sélecteur de province | ✅ | ✅ | `canada.test.ts`, RNTL, Playwright `e2e/web-auth.spec.ts` | Liste cherchable en feuille du bas. Le nom de la province est au-dessus du badge. Le préfixe postal reste dans son champ. La province suggérée est présélectionnée. Le badge et la note sur les fournisseurs viennent du même enregistrement. Le Nouveau-Brunswick et la Nouvelle-Écosse sont « entièrement couvert » / « Fully covered » (`0011` : programmes ouverts publiés, Nova Scotia Power publié). Ailleurs : « programmes fédéraux seulement », note sur les fournisseurs, et bouton de liste d'attente. Jamais le GPS. `/(auth)/e2e` est le profil seulement. Les photos d'essai sont sur `/(auth)/e2e-photo`. Les deux ne s'ouvrent que si `EXPO_PUBLIC_E2E=1` et que l'environnement n'est ni `preview` ni `production`. |
| Liste d'attente hors NB/NS | ✅ | ✅ | pgTAP `0009_coverage.sql` | Courriel + province + consentement seulement. |
| Estimation et plan | ✅ | ✅ | unitaires existants | Avis d'affiliation selon la province. Défaut NB inchangé. |
| Photos S08/S09 | ✅ | ✅ | `prepare-photo`, `web-photo-picker.test.ts`, Playwright `e2e/web-auth.spec.ts` | Web : `<input type="file" accept="image/*" capture="environment">` et dépôt. Même chemin Storage et EXIF. Playwright ouvre `/e2e-photo`, pas l'écran profil. L'aperçu est vérifié, pas l'envoi Storage (session requise). |
| Avant / après (M3-10) | ✅ | ✅ | `visualize-client.test.ts` | Carte existante sur l'item du plan. |
| Subventions | ✅ | ✅ | checklist + seed | Brouillons `draft` cachés (`is_published` faux). |
| Paiement | ✅ | ✅ | mocks | IAP RevenueCat dans l'app, Stripe sur le web (ADR-011). |
| Suppression de compte | ✅ | ✅ | pgTAP `0007` | Page `delete-account.html` en plus. |
| FR/EN | ✅ | ✅ | `keys.test.ts` | Chaque clé existe en fr-CA et en en-CA. |
| Admin A01–A04 | ✅ (Expo web) | ✅ | RNTL | Filtre par province. L'admin est prévu sur Expo web (ADR-004). |
| Maestro Android + Playwright web | ✅ partiel | ✅ | `pnpm test:web` (hors `pnpm test`) | Playwright Chromium : connexion, OTP, province, photo. Pas dans le job CI `pnpm test` (installation Chromium séparée). Maestro : flows existants, relancés seulement si un émulateur est disponible. |

Une tâche n'est terminée que si Mobile et Web sont ✅, ou si l'écart et le repli sont écrits dans cette table.
