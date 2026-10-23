# Auth sociale — ce que Brown doit créer

Rien ici n'est un compte déjà ouvert. **Ne pas commiter de clé.** Les seules valeurs versionnées sont les `replace-…` de `.env.example`. L'essai live reste **BLOCKED: needs Brown keys**.

Schéma de l'app : `renoroute://` (`packages/shared/src/config/brand.ts`). Redirect natif : `renoroute://auth/callback`.

## 1. Google Cloud (iOS, Android, Web)

1. Ouvrir Google Cloud Console → APIs & Services → Credentials.
2. Créer **trois** clients OAuth 2.0 :
   - Web application
   - iOS (`ca.renoroute.app`)
   - Android (`ca.renoroute.app` + empreinte SHA-1 du keystore de Brown)
3. Redirect Web / Supabase : `{SUPABASE_URL}/auth/v1/callback`
4. Redirect natif : `renoroute://auth/callback`
5. Scopes : `openid`, `email`, `profile` seulement.
6. Coller l'id Web dans `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` et l'id iOS dans `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` (`.env.local` + secrets EAS). Activer le fournisseur Google dans Supabase Auth avec le **secret Web** (secret Supabase, jamais dans l'app).

## 2. Meta (Facebook Login)

1. Ouvrir Meta for Developers → créer une app « Consommateur ».
2. Ajouter le produit **Facebook Login**.
3. Redirect : `{SUPABASE_URL}/auth/v1/callback` et `renoroute://auth/callback`
4. Permissions : `email`, `public_profile` seulement.
5. Coller l'App ID dans `EXPO_PUBLIC_FACEBOOK_APP_ID`. App Secret → secrets Supabase (fournisseur Facebook). Jamais dans l'app.

## 3. TikTok for Developers (Login Kit)

TikTok n'est **pas** un fournisseur natif Supabase. L'app ouvre Login Kit (OAuth 2.0 + PKCE). L'Edge Function `tiktok-auth` échange le code.

1. Ouvrir TikTok for Developers → créer une app Login Kit.
2. Redirect : `renoroute://auth/callback` (exactement).
3. Scopes demandés : `user.info.basic`. **TODO(verify)** : le nom exact du scope courriel chez TikTok ; sans courriel, l'app refuse et propose l'OTP.
4. Client key → `EXPO_PUBLIC_TIKTOK_CLIENT_KEY`.
5. Client secret → `supabase secrets set TIKTOK_CLIENT_SECRET=…` seulement.

## 4. Apple (iOS uniquement)

Guideline 4.8 **TODO(verify)** : si une connexion sociale tierce est offerte sur iOS, Sign in with Apple (ou une option équivalente) doit l'être aussi.

1. Apple Developer → Services ID + clé Sign in with Apple.
2. Redirect : `{SUPABASE_URL}/auth/v1/callback`
3. Coller le Services ID dans `EXPO_PUBLIC_APPLE_SERVICE_ID`. Secret → Supabase Auth.

## 5. Supabase Auth

1. Authentication → Providers : activer Email (OTP), Google, Facebook, Apple.
2. Authentication → URL Configuration : ajouter `renoroute://auth/callback`.
3. Secrets Edge : `TIKTOK_CLIENT_SECRET` (et `TIKTOK_CLIENT_KEY` si différent de la valeur publique).
4. `tiktok-auth` a `verify_jwt = false` (l'utilisateur n'est pas encore connecté).

## 6. Ce que Brown envoie à l'agent (aucune création de compte par l'agent)

- IDs publics Google (web + iOS), Facebook App ID, TikTok client key, Apple Services ID
- Confirmation que les secrets sont dans Supabase / EAS, pas dans git
- SHA-1 Android et compte Apple Developer

Jusqu'à ces valeurs, les boutons affichent le message « pas encore disponible » et les tests utilisent des mocks.
