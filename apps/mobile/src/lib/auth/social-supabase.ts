import { BRAND } from '@renoroute/shared/config/brand';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

import { openAuthSession } from './social-browser';
import {
  failureFromAuthError,
  readOAuthCallback,
  signInWithSocial,
  socialClientIds,
  SUPABASE_SOCIAL_SCOPES,
  type SocialAuthPort,
  type SocialFailure,
  type SocialProvider,
  type SocialSignInResult,
} from './social-sign-in';
import { startTikTokAuthorize } from './social-tiktok';

type Auth = NonNullable<typeof supabase>['auth'];
type Functions = NonNullable<typeof supabase>['functions'];

/** TODO(verify): allow this redirect in Supabase Auth and provider consoles. */
const redirectTo = () =>
  AuthSession.makeRedirectUri({ scheme: BRAND.scheme, path: 'auth/callback' });

export function requestSocialSignIn(provider: SocialProvider): Promise<SocialSignInResult> {
  const config = socialClientIds({
    EXPO_PUBLIC_APPLE_SERVICE_ID: process.env.EXPO_PUBLIC_APPLE_SERVICE_ID,
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    EXPO_PUBLIC_FACEBOOK_APP_ID: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
    EXPO_PUBLIC_TIKTOK_CLIENT_KEY: process.env.EXPO_PUBLIC_TIKTOK_CLIENT_KEY,
  });
  return signInWithSocial({
    provider,
    client: supabase ? portFrom(supabase.auth, supabase.functions) : null,
    platform: Platform.OS,
    config,
    redirectTo: redirectTo(),
    openAuthSession,
    startTikTokAuthorize: () =>
      startTikTokAuthorize({
        clientKey: config.tiktokClientKey ?? '',
        redirectTo: redirectTo(),
      }),
  });
}

function portFrom(auth: Auth, functions: Functions): SocialAuthPort {
  return {
    signInWithIdToken: (input) => signInWithProviderToken(auth, input),
    signInWithOAuth: (input) => startOAuth(auth, input),
    completeRedirect: (callbackUrl, flowId) => completeRedirect(auth, callbackUrl, flowId),
    completeTikTok: (input) => completeTikTok(auth, functions, input),
  };
}

async function signInWithProviderToken(
  auth: Auth,
  input: { provider: SocialProvider; token: string; nonce?: string },
): Promise<{ errorMessage: string | null; failure?: SocialFailure }> {
  if (input.provider === 'facebook' || input.provider === 'tiktok') {
    return { errorMessage: 'rejected', failure: 'rejected' };
  }
  const { error } = await auth.signInWithIdToken({
    provider: input.provider,
    token: input.token,
    ...(input.nonce ? { nonce: input.nonce } : {}),
  });
  return error
    ? { errorMessage: 'rejected', failure: failureFromAuthError(error) }
    : { errorMessage: null };
}

async function startOAuth(
  auth: Auth,
  input: { provider: SocialProvider; redirectTo: string },
): Promise<{ url: string | null; flowId?: string | null; errorMessage: string | null }> {
  if (input.provider === 'tiktok') {
    return { url: null, errorMessage: 'rejected' };
  }
  const scopes =
    input.provider === 'google' || input.provider === 'facebook'
      ? SUPABASE_SOCIAL_SCOPES[input.provider]
      : undefined;
  const { data, error } = await auth.signInWithOAuth({
    provider: input.provider,
    options: {
      redirectTo: input.redirectTo,
      skipBrowserRedirect: true,
      ...(scopes ? { queryParams: { scope: scopes }, scopes } : {}),
    },
  });
  if (error) {
    return { url: null, errorMessage: 'rejected' };
  }
  return { url: data.url, flowId: data.flowId ?? null, errorMessage: null };
}

async function completeRedirect(
  auth: Auth,
  callbackUrl: string,
  flowId?: string | null,
): Promise<{ errorMessage: string | null; failure?: SocialFailure }> {
  const callback = readOAuthCallback(callbackUrl);
  if (callback.kind === 'denied') {
    return { errorMessage: 'rejected', failure: 'denied' };
  }
  if (callback.kind === 'code') {
    const { error } = await auth.exchangeCodeForSession(
      callback.code,
      flowId ? { flowId } : undefined,
    );
    return error
      ? { errorMessage: 'rejected', failure: failureFromAuthError(error) }
      : { errorMessage: null };
  }
  if (callback.kind === 'tokens') {
    const { error } = await auth.setSession({
      access_token: callback.accessToken,
      refresh_token: callback.refreshToken,
    });
    return error
      ? { errorMessage: 'rejected', failure: failureFromAuthError(error) }
      : { errorMessage: null };
  }
  return { errorMessage: 'rejected', failure: 'rejected' };
}

async function completeTikTok(
  auth: Auth,
  functions: Functions,
  input: { code: string; codeVerifier: string; redirectTo: string },
): Promise<{ errorMessage: string | null; failure?: SocialFailure }> {
  const { data, error } = await functions.invoke('tiktok-auth', {
    body: {
      code: input.code,
      codeVerifier: input.codeVerifier,
      redirectUri: input.redirectTo,
    },
  });
  const payload = await readTikTokPayload(data, error);
  if (!payload.ok) {
    return { errorMessage: 'rejected', failure: payload.reason ?? 'rejected' };
  }
  if (!payload.access_token || !payload.refresh_token) {
    return { errorMessage: 'rejected', failure: 'rejected' };
  }
  const session = await auth.setSession({
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
  });
  return session.error
    ? { errorMessage: 'rejected', failure: failureFromAuthError(session.error) }
    : { errorMessage: null };
}

async function readTikTokPayload(
  data: unknown,
  error: unknown,
): Promise<{
  ok?: boolean;
  reason?: SocialFailure;
  access_token?: string;
  refresh_token?: string;
}> {
  if (data && typeof data === 'object') {
    return data as {
      ok?: boolean;
      reason?: SocialFailure;
      access_token?: string;
      refresh_token?: string;
    };
  }
  const context =
    error && typeof error === 'object' && 'context' in error
      ? (error as { context?: Response }).context
      : undefined;
  if (context && typeof context.json === 'function') {
    try {
      return (await context.json()) as {
        ok?: boolean;
        reason?: SocialFailure;
        access_token?: string;
        refresh_token?: string;
      };
    } catch {
      return {};
    }
  }
  return {};
}
