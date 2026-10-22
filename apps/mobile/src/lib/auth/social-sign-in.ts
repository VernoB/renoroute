/**
 * Social sign-in (Apple and Google) behind a small port so screens and tests
 * do not import @supabase/supabase-js. The route wires the real client.
 *
 * TODO(verify): public client ids only. Never commit a client secret or a
 * service-account JSON file.
 * - EXPO_PUBLIC_APPLE_SERVICE_ID — Apple Services ID used with Supabase Auth.
 * - EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID — Google OAuth web client id.
 * - EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID — Google iOS client id. Required before
 *   Google sign-in is treated as configured on iOS.
 * A missing value, or one that starts with "replace-", means that provider
 * is not configured.
 *
 * TODO(verify): Apple App Review Guideline 4.8 — if Google sign-in is offered
 * on iOS, Sign in with Apple must be offered too. Store-policy compliance has
 * not been confirmed. This flow has not been tested on a real device.
 */

export type SocialProvider = 'apple' | 'google';

export type SocialFailure = 'unconfigured' | 'cancelled' | 'rejected' | 'offline';

export type SocialSignInResult = { ok: true } | { ok: false; failure: SocialFailure };

export type SocialClientIds = {
  appleServiceId?: string | undefined;
  googleWebClientId?: string | undefined;
  googleIosClientId?: string | undefined;
};

export type AuthSessionResult =
  { type: 'success'; url: string } | { type: 'cancel' } | { type: 'error' };

export type SocialAuthPort = {
  signInWithIdToken(input: {
    provider: SocialProvider;
    token: string;
    nonce?: string;
  }): Promise<{ errorMessage: string | null }>;
  signInWithOAuth(input: {
    provider: SocialProvider;
    redirectTo: string;
  }): Promise<{ url: string | null; flowId?: string | null; errorMessage: string | null }>;
  completeRedirect(
    callbackUrl: string,
    flowId?: string | null,
  ): Promise<{ errorMessage: string | null }>;
};

export type SocialSignInInput = {
  provider: SocialProvider;
  platform: string;
  client: SocialAuthPort | null;
  config: SocialClientIds;
  redirectTo: string;
  openAuthSession: (authUrl: string, redirectTo: string) => Promise<AuthSessionResult>;
  idToken?: { token: string; nonce?: string } | null;
};

export type OAuthCallback =
  | { kind: 'code'; code: string }
  | { kind: 'tokens'; accessToken: string; refreshToken: string }
  | { kind: 'error' }
  | { kind: 'missing' };

type ReadySocialSignIn = SocialSignInInput & { client: SocialAuthPort };

export function requiresAppleSignIn(platform: string): boolean {
  return platform === 'ios';
}

export function socialProvidersFor(platform: string): readonly SocialProvider[] {
  return requiresAppleSignIn(platform) ? ['apple', 'google'] : ['google'];
}

export function isPlaceholderClientId(value: string | undefined): boolean {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 || trimmed.startsWith('replace-');
}

export function socialClientIds(env: {
  EXPO_PUBLIC_APPLE_SERVICE_ID?: string | undefined;
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?: string | undefined;
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?: string | undefined;
}): SocialClientIds {
  return {
    appleServiceId: env.EXPO_PUBLIC_APPLE_SERVICE_ID,
    googleWebClientId: env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    googleIosClientId: env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
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
): 'auth.continueWithApple' | 'auth.continueWithGoogle' {
  return provider === 'apple' ? 'auth.continueWithApple' : 'auth.continueWithGoogle';
}

export function socialFailureMessageKey(
  failure: SocialFailure,
): 'auth.offline' | 'auth.socialUnconfigured' | 'auth.socialError' | null {
  if (failure === 'cancelled') {
    return null;
  }
  if (failure === 'offline') {
    return 'auth.offline';
  }
  if (failure === 'unconfigured') {
    return 'auth.socialUnconfigured';
  }
  return 'auth.socialError';
}

export function readOAuthCallback(url: string): OAuthCallback {
  const params = callbackParams(url);
  if (params.get('error')) {
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

export async function signInWithSocial(input: SocialSignInInput): Promise<SocialSignInResult> {
  if (!isReady(input)) {
    return { ok: false, failure: 'unconfigured' };
  }
  try {
    return await runSocialSignIn(input);
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

async function runSocialSignIn(input: ReadySocialSignIn): Promise<SocialSignInResult> {
  if (input.idToken) {
    return finishIdToken(input.client, input.provider, input.idToken);
  }
  return finishOAuth(input.client, input);
}

async function finishIdToken(
  client: SocialAuthPort,
  provider: SocialProvider,
  idToken: { token: string; nonce?: string },
): Promise<SocialSignInResult> {
  const signedIn = await client.signInWithIdToken({
    provider,
    token: idToken.token,
    ...(idToken.nonce ? { nonce: idToken.nonce } : {}),
  });
  return signedIn.errorMessage ? { ok: false, failure: 'rejected' } : { ok: true };
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
  if (opened.type !== 'success') {
    return { ok: false, failure: 'rejected' };
  }
  const completed = await client.completeRedirect(opened.url, started.flowId);
  return completed.errorMessage ? { ok: false, failure: 'rejected' } : { ok: true };
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
