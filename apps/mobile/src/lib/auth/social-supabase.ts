import * as ExpoLinking from 'expo-linking';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

import { openAuthSession } from './social-browser';
import {
  readOAuthCallback,
  signInWithSocial,
  socialClientIds,
  type SocialAuthPort,
  type SocialProvider,
  type SocialSignInResult,
} from './social-sign-in';

type Auth = NonNullable<typeof supabase>['auth'];

/** TODO(verify): allow this redirect in Supabase Auth. Not verified on a device. */
const redirectTo = () => ExpoLinking.createURL('auth/callback');

export function requestSocialSignIn(provider: SocialProvider): Promise<SocialSignInResult> {
  return signInWithSocial({
    provider,
    client: supabase ? portFrom(supabase.auth) : null,
    platform: Platform.OS,
    config: socialClientIds({
      EXPO_PUBLIC_APPLE_SERVICE_ID: process.env.EXPO_PUBLIC_APPLE_SERVICE_ID,
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    }),
    redirectTo: redirectTo(),
    openAuthSession,
  });
}

function portFrom(auth: Auth): SocialAuthPort {
  return {
    signInWithIdToken: (input) => signInWithProviderToken(auth, input),
    signInWithOAuth: (input) => startOAuth(auth, input),
    completeRedirect: (callbackUrl, flowId) => completeRedirect(auth, callbackUrl, flowId),
  };
}

async function signInWithProviderToken(
  auth: Auth,
  input: { provider: SocialProvider; token: string; nonce?: string },
): Promise<{ errorMessage: string | null }> {
  const { error } = await auth.signInWithIdToken({
    provider: input.provider,
    token: input.token,
    ...(input.nonce ? { nonce: input.nonce } : {}),
  });
  return { errorMessage: error ? 'rejected' : null };
}

async function startOAuth(
  auth: Auth,
  input: { provider: SocialProvider; redirectTo: string },
): Promise<{ url: string | null; flowId?: string | null; errorMessage: string | null }> {
  const { data, error } = await auth.signInWithOAuth({
    provider: input.provider,
    options: { redirectTo: input.redirectTo, skipBrowserRedirect: true },
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
): Promise<{ errorMessage: string | null }> {
  const callback = readOAuthCallback(callbackUrl);
  if (callback.kind === 'code') {
    const { error } = await auth.exchangeCodeForSession(
      callback.code,
      flowId ? { flowId } : undefined,
    );
    return { errorMessage: error ? 'rejected' : null };
  }
  if (callback.kind === 'tokens') {
    const { error } = await auth.setSession({
      access_token: callback.accessToken,
      refresh_token: callback.refreshToken,
    });
    return { errorMessage: error ? 'rejected' : null };
  }
  return { errorMessage: 'rejected' };
}
