# 08 — Checklist de lancement (bêta fermée MVP)

Responsable : **Tech Lead** (Brown valide). À cocher entièrement avant d'ouvrir la bêta (tâche M6-10).

## 1. Stratégie de test (propriété QA)
| Niveau | Outil | Portée | Quand |
|---|---|---|---|
| Unitaires | Jest | `packages/shared` (Zod, calc, admissibilité, i18n clés) | chaque PR |
| Composants | Jest + RNTL | écrans/composants critiques | chaque PR |
| BD/RLS | pgTAP (`supabase test db`) | policies, privilèges, triggers | chaque PR touchant SQL |
| Edge Functions | Deno test (mocks IA/Stripe) | functions | chaque PR touchant functions |
| E2E | Maestro | parcours S01→S17 FR + EN, iOS + Android | avant chaque build preview/production |
| IA | `pnpm eval` (25 cas) | qualité/garde-fous | à chaque changement de prompt/modèle |
| Manuel | appareils réels | caméra, EXIF, paiement, VoiceOver/TalkBack | avant bêta |
Matrice minimale d'appareils : 1 iPhone récent, 1 iPhone ancien encore supporté par le SDK Expo, 1 Android milieu de gamme, 1 Android ancien/bas de gamme (à préciser selon les appareils disponibles).

## 2. Produit et contenu
- [ ] Parcours complet fonctionnel FR et EN (inscription → plan payé → checklist subventions)
- [ ] Avis légal (non officiel, non affilié à NB Power) sur tous les écrans de plan, la fiche store et le site
- [ ] Chaque programme publié a `source_url` officiel et `last_verified_at` ≤ 7 jours avant le lancement (vérifiés par Brown)
- [ ] Programmes fermés (ex. Greener Homes Loan) non publiés ; programmes annoncés (remise fédérale 2027) affichés comme « à venir »
- [ ] `measure_benchmarks` remplis avec sources pour toutes les mesures proposées
- [ ] 10 plans d'évaluation relus par Brown (note ≥ 4/5)
- [ ] Microcopie FR relue par un francophone (idéalement acadien/néo-brunswickois) et EN par un anglophone
- [ ] Nom final choisi 🟨, `brand.ts` mis à jour, vérification de marque (recherche CIPO/OPIC — à faire) et nom de domaine acheté

## 3. Juridique et conformité
- [ ] Politique de confidentialité + CGU FR/EN publiées (révisées par un professionnel 🟨)
- [ ] Politique de remboursement publiée 🟨
- [ ] Entité légale + inscription TPS/TVH si requis (avis comptable 🟨)
- [ ] Consentements séparés et journalisés ; marketing opt-in (LCAP/CASL)
- [ ] Procédure d'atteinte à la vie privée + registre (PIPEDA)
- [ ] Registre des sous-traitants (Supabase, fournisseur IA, Stripe, Expo, Sentry, PostHog, SMTP) et pays de traitement
- [ ] Aucune utilisation des logos/marque NB Power ou gouvernementaux

## 4. Sécurité
- [ ] Checklist `05-security.md` §15 entièrement cochée

## 5. Paiements
- [ ] Décision IAP vs Stripe documentée (ADR) et validée en review Apple/Google 🟨
- [ ] Stripe en mode live : compte vérifié, virement bancaire configuré, descripteur de relevé clair
- [ ] Webhook live configuré et testé (paiement réel de 1 achat + remboursement)
- [ ] Taxes correctes sur le reçu (TVH 15 % NB — à vérifier selon province de l'acheteur)

## 6. Stores
- [ ] Apple Developer Program (99 USD/an) et Google Play Console (25 USD) actifs
- [ ] Fiches FR/EN : description, mots-clés, captures (tailles requises), icône, URL confidentialité, URL support
- [ ] App Privacy (Apple) et Data safety (Google) remplis selon les SDK réels
- [ ] Privacy manifest iOS vérifié ; textes de permissions caméra/photos/micro traduits
- [ ] Suppression de compte in-app + page web (Google)
- [ ] Compte de démonstration pour l'équipe de review (avec plan déjà débloqué) + notes de review expliquant le service
- [ ] Classification de contenu (questionnaires IARC / âge) remplie
- [ ] TestFlight (externe) et Google Play test fermé ; vérifier les exigences actuelles de Google pour les nouveaux comptes développeurs personnels (nombre minimum de testeurs et durée du test fermé — à vérifier)

## 7. Opérations
- [ ] Supabase prod sur palier adapté (Pro recommandé au lancement public), région documentée
- [ ] Sauvegardes actives + restauration testée
- [ ] Sentry alertes (crash rate, erreurs functions) → courriel Brown
- [ ] Plafond de dépense IA + alerte ; kill switch testé
- [ ] Alerte hebdo « programmes à revérifier » active (M5-06)
- [ ] Tableau de bord PostHog : entonnoir inscription → intake → aperçu → paiement ; flag test de prix
- [ ] EAS Update configuré (canal production) + procédure de rollback
- [ ] Courriel support fonctionnel (domaine), réponse ≤ 48 h en FR/EN

## 8. Bêta
- [ ] 10–20 testeurs NB recrutés (mix FR/EN, urbain/rural, types de chauffage) 🟨
- [ ] Formulaire de feedback in-app ou courriel
- [ ] Critères de passage au lancement public définis (ex. taux de crash, NPS, % plans jugés utiles, taux de conversion aperçu → payé) 🟨
