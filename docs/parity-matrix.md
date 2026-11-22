# Parité mobile / web

Même code Expo (`apps/mobile`) pour iOS, Android et le web (`expo start --web`). `apps/landing` est le site vitrine, pas l'app.

| Fonction | Mobile | Web | Tests | Notes |
|---|---|---|---|---|
| Accueil / onboarding animé | ✅ | ✅ | RNTL + Maestro `onboarding.yaml` | Reduce motion : fondu court. Vidéo Android dans `docs/media/`. |
| Connexion sociale + OTP + confiance | ✅ | ✅ | RNTL FR/EN, `otp-code.test.ts` | Apple seulement sur iOS (guideline 4.8). Web : les mêmes écrans. |
| Consentements non pré-cochés | ✅ | ✅ | RNTL | Feuille « en savoir plus » vers `privacy.html` / `terms.html`. |
| Sélecteur de province | ✅ | ✅ | `canada.test.ts` | Suggestion par la 1re lettre du code postal. Jamais le GPS. |
| Liste d'attente hors NB/NS | ✅ | ✅ | pgTAP `0009_coverage.sql` | Courriel + province + consentement seulement. |
| Estimation et plan | ✅ | ✅ | unitaires existants | Avis d'affiliation selon la province. Défaut NB inchangé. |
| Photos S08/S09 | ✅ | ✅ | `prepare-photo`, `web-photo-picker.test.ts` | Web : `<input type="file" accept="image/*" capture="environment">` et dépôt. Même chemin Storage et EXIF. |
| Avant / après (M3-10) | ✅ | ✅ | `visualize-client.test.ts` | Carte existante sur l'item du plan. |
| Subventions | ✅ | ✅ | checklist + seed | Brouillons `draft` cachés (`is_published` faux). |
| Paiement | ✅ | ✅ | mocks | IAP RevenueCat dans l'app, Stripe sur le web (ADR-011). |
| Suppression de compte | ✅ | ✅ | pgTAP `0007` | Page `delete-account.html` en plus. |
| FR/EN | ✅ | ✅ | `keys.test.ts` | Chaque clé existe en fr-CA et en en-CA. |
| Admin A01–A04 | ✅ (Expo web) | ✅ | RNTL | Filtre par province. L'admin est prévu sur Expo web (ADR-004). |
| Maestro Android + Playwright web | ✅ partiel | écart | matrice lue en CI | Maestro : flows existants, pas relancés dans cette session (émulateur non prouvé ici). Playwright : pas de dépendance navigateur dans le dépôt. Le contrôle web est testé par `web-photo-picker.test.ts`. |

Une tâche n'est terminée que si Mobile et Web sont ✅, ou si l'écart et le repli sont écrits dans cette table.
