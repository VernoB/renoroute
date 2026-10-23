/**
 * Social sign-in behind a small port so screens and tests do not import
 * @supabase/supabase-js. The route wires the real client.
 *
 * Google and Facebook go through Supabase Auth (PKCE). TikTok is not a
 * native Supabase provider: the app opens TikTok Login Kit, then
 * `tiktok-auth` exchanges the code. The TikTok client secret never ships
 * in the app.
 *
 * TODO(verify): public client ids only. Never commit a client secret.
 * - EXPO_PUBLIC_APPLE_SERVICE_ID
 * - EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID / EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
 * - EXPO_PUBLIC_FACEBOOK_APP_ID
 * - EXPO_PUBLIC_TIKTOK_CLIENT_KEY
 * A missing value, or one that starts with "replace-", means that provider
 * is not configured. Live sign-in is BLOCKED: needs Brown keys.
 *
 * TODO(verify): Apple App Review Guideline 4.8 — if a third-party social
 * login is offered on iOS, Sign in with Apple (or an equivalent privacy
 * option) must be offered too. The current guideline text has not been
 * re-checked on a real device.
 */

export type SocialProvider = 'apple' | 'google' | 'facebook' | 'tiktok';

export type SocialFailure =
  | 'unconfigured'
  | 'cancelled'
  | 'rejected'
  | 'offline'
  | 'denied'
  | 'email_exists'
  | 'email_missing';

export type SocialSignInResult = { ok: true } | { ok: false; failure: SocialFailure };

export type SocialClientIds = {
  appleServiceId?: string | undefined;
  googleWebClientId?: string | undefined;
  googleIosClientId?: string | undefined;
  facebookAppId?: string | undefined;
  tiktokClientKey?: string | undefined;
};

export type AuthSessionResult =
  { type: 'success'; url: string } | { type: 'cancel' } | { type: 'denied' } | { type: 'error' };

export type SocialAuthPort = {
  signInWithIdToken(input: {
    provider: SocialProvider;
    token: string;
    nonce?: string;
  }): Promise<{ errorMessage: string | null; failure?: SocialFailure }>;
  signInWithOAuth(input: {
    provider: SocialProvider;
    redirectTo: string;
  }): Promise<{ url: string | null; flowId?: string | null; errorMessage: string | null }>;
  completeRedirect(
    callbackUrl: string,
    flowId?: string | null,
  ): Promise<{ errorMessage: string | null; failure?: SocialFailure }>;
  completeTikTok(input: {
    code: string;
    codeVerifier: string;
    redirectTo: string;
  }): Promise<{ errorMessage: string | null; failure?: SocialFailure }>;
};

export type TikTokAuthorizeStart =
  | { type: 'success'; code: string; codeVerifier: string }
  | { type: 'cancel' }
  | { type: 'denied' }
  | { type: 'error' };

export type SocialSignInInput = {
  provider: SocialProvider;
  platform: string;
  client: SocialAuthPort | null;
  config: SocialClientIds;
  redirectTo: string;
  openAuthSession: (authUrl: string, redirectTo: string) => Promise<AuthSessionResult>;
  idToken?: { token: string; nonce?: string } | null;
  startTikTokAuthorize?: () => Promise<TikTokAuthorizeStart>;
};

export type OAuthCallback =
  | { kind: 'code'; code: string }
  | { kind: 'tokens'; accessToken: string; refreshToken: string }
  | { kind: 'denied' }
  | { kind: 'error' }
  | { kind: 'missing' };

export const TIKTOK_SCOPES = ['user.info.basic'] as const;

export const SUPABASE_SOCIAL_SCOPES: Record<'google' | 'facebook', string> = {
  google: 'openid email profile',
  facebook: 'email,public_profile',
};

type ReadySocialSignIn = SocialSignInInput & { client: SocialAuthPort };

const LABEL_KEYS = {
  apple: 'auth.continueWithApple',
  google: 'auth.continueWithGoogle',
  facebook: 'auth.continueWithFacebook',
  tiktok: 'auth.continueWithTikTok',
} as const;

export function requiresAppleSignIn(platform: string): boolean {
  return platform === 'ios';
}

export function socialProvidersFor(platform: string): readonly SocialProvider[] {
  return requiresAppleSignIn(platform)
    ? ['apple', 'google', 'facebook', 'tiktok']
    : ['google', 'facebook', 'tiktok'];
}

export function isPlaceholderClientId(value: string | undefined): boolean {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 || trimmed.startsWith('replace-');
}

export function socialClientIds(env: {
  EXPO_PUBLIC_APPLE_SERVICE_ID?: string | undefined;
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?: string | undefined;
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?: string | undefined;
  EXPO_PUBLIC_FACEBOOK_APP_ID?: string | undefined;
  EXPO_PUBLIC_TIKTOK_CLIENT_KEY?: string | undefined;
}): SocialClientIds {
  return {
    appleServiceId: env.EXPO_PUBLIC_APPLE_SERVICE_ID,
    googleWebClientId: env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    googleIosClientId: env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    facebookAppId: env.EXPO_PUBLIC_FACEBOOK_APP_ID,
    tiktokClientKey: env.EXPO_PUBLIC_TIKTOK_CLIENT_KEY,
  };
}

export function isSocialProviderConfigured(
  provider: SocialProvider,
  platform: string,
  config: SocialClientIds,
): boolean {
  if (provider === 'apple') {
    return requiresAppleSignIn(platform) && !isPlaceholderClientId(config.appleServiceId);
  }
  if (provider === 'facebook') {
    return !isPlaceholderClientId(config.facebookAppId);
  }
  if (provider === 'tiktok') {
    return !isPlaceholderClientId(config.tiktokClientKey);
  }
  if (isPlaceholderClientId(config.googleWebClientId)) {
    return false;
  }
  if (platform === 'ios') {
    return !isPlaceholderClientId(config.googleIosClientId);
  }
  return true;
}

export function socialProviderLabelKey(
  provider: SocialProvider,
): (typeof LABEL_KEYS)[SocialProvider] {
  return LABEL_KEYS[provider];
}

export function socialFailureMessageKey(
  failure: SocialFailure,
):
  | 'auth.offline'
  | 'auth.socialUnconfigured'
  | 'auth.socialError'
  | 'auth.socialDenied'
  | 'auth.socialEmailExists'
  | 'auth.socialEmailMissing'
  | null {
  if (failure === 'cancelled') {
    return null;
  }
  if (failure === 'offline') {
    return 'auth.offline';
  }
  if (failure === 'unconfigured') {
    return 'auth.socialUnconfigured';
  }
  if (failure === 'denied') {
    return 'auth.socialDenied';
  }
  if (failure === 'email_exists') {
    return 'auth.socialEmailExists';
  }
  if (failure === 'email_missing') {
    return 'auth.socialEmailMissing';
  }
  return 'auth.socialError';
}

export function failureFromAuthError(
  error: {
    code?: string | undefined;
    message?: string | undefined;
  } | null,
): SocialFailure {
  const code = error?.code ?? '';
  const message = error?.message ?? '';
  if (code === 'identity_already_exists' || /already (registered|exists)/i.test(message)) {
    return 'email_exists';
  }
  if (code === 'access_denied' || /access_denied/i.test(message)) {
    return 'denied';
  }
  return 'rejected';
}

export function readOAuthCallback(url: string): OAuthCallback {
  const params = callbackParams(url);
  const error = params.get('error');
  if (error === 'access_denied') {
    return { kind: 'denied' };
  }
  if (error) {
    return { kind: 'error' };
  }
  const code = params.get('code');
  if (code) {
    return { kind: 'code', code };
  }
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (accessToken && refreshToken) {
    return { kind: 'tokens', accessToken, refreshToken };
  }
  return { kind: 'missing' };
}

export function buildTiktokAuthorizeUrl(input: {
  clientKey: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}): string {
  const url = new URL('https://www.tiktok.com/v2/auth/authorize/');
  url.searchParams.set('client_key', input.clientKey);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', TIKTOK_SCOPES.join(','));
  url.searchParams.set('redirect_uri', input.redirectUri);
  url.searchParams.set('state', input.state);
  url.searchParams.set('code_challenge', input.codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

export async function signInWithSocial(input: SocialSignInInput): Promise<SocialSignInResult> {
  if (!isReady(input)) {
    return { ok: false, failure: 'unconfigured' };
  }
  try {
    return input.provider === 'tiktok' ? await runTikTok(input) : await runSocialSignIn(input);
  } catch (error) {
    return { ok: false, failure: thrownFailure(error) };
  }
}

function isReady(input: SocialSignInInput): input is ReadySocialSignIn {
  return (
    input.client !== null &&
    isSocialProviderConfigured(input.provider, input.platform, input.config)
  );
}

function thrownFailure(error: unknown): SocialFailure {
  return error instanceof Error && error.message === 'offline' ? 'offline' : 'rejected';
}

function portFailure(result: {
  errorMessage: string | null;
  failure?: SocialFailure;
}): SocialSignInResult {
  if (!result.errorMessage) {
    return { ok: true };
  }
  return { ok: false, failure: result.failure ?? 'rejected' };
}

async function runSocialSignIn(input: ReadySocialSignIn): Promise<SocialSignInResult> {
  if (input.idToken) {
    return portFailure(
      await input.client.signInWithIdToken({
        provider: input.provider,
        token: input.idToken.token,
        ...(input.idToken.nonce ? { nonce: input.idToken.nonce } : {}),
      }),
    );
  }
  return finishOAuth(input.client, input);
}

async function finishOAuth(
  client: SocialAuthPort,
  input: ReadySocialSignIn,
): Promise<SocialSignInResult> {
  const started = await client.signInWithOAuth({
    provider: input.provider,
    redirectTo: input.redirectTo,
  });
  if (started.errorMessage || !started.url) {
    return { ok: false, failure: 'rejected' };
  }
  const opened = await input.openAuthSession(started.url, input.redirectTo);
  if (opened.type === 'cancel') {
    return { ok: false, failure: 'cancelled' };
  }
  if (opened.type === 'denied') {
    return { ok: false, failure: 'denied' };
  }
  if (opened.type !== 'success') {
    return { ok: false, failure: 'rejected' };
  }
  const callback = readOAuthCallback(opened.url);
  if (callback.kind === 'denied') {
    return { ok: false, failure: 'denied' };
  }
  return portFailure(await client.completeRedirect(opened.url, started.flowId));
}

async function runTikTok(input: ReadySocialSignIn): Promise<SocialSignInResult> {
  if (!input.startTikTokAuthorize) {
    return { ok: false, failure: 'unconfigured' };
  }
  const started = await input.startTikTokAuthorize();
  if (started.type === 'cancel') {
    return { ok: false, failure: 'cancelled' };
  }
  if (started.type === 'denied') {
    return { ok: false, failure: 'denied' };
  }
  if (started.type !== 'success') {
    return { ok: false, failure: 'rejected' };
  }
  return portFailure(
    await input.client.completeTikTok({
      code: started.code,
      codeVerifier: started.codeVerifier,
      redirectTo: input.redirectTo,
    }),
  );
}

function callbackParams(url: string): URLSearchParams {
  const params = new URLSearchParams();
  const queryAt = url.indexOf('?');
  const hashAt = url.indexOf('#');
  if (queryAt >= 0) {
    const end = hashAt > queryAt ? hashAt : url.length;
    copyParams(params, url.slice(queryAt + 1, end));
  }
  if (hashAt >= 0) {
    copyParams(params, url.slice(hashAt + 1));
  }
  return params;
}

function copyParams(target: URLSearchParams, raw: string): void {
  for (const [key, value] of new URLSearchParams(raw)) {
    target.set(key, value);
  }
}
