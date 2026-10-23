import * as WebBrowser from 'expo-web-browser';

import { readOAuthCallback, type AuthSessionResult } from './social-sign-in';

/**
 * Opens the provider page in an auth session and waits for the app redirect.
 * TODO(verify): not tested with live Meta / Google / TikTok apps.
 * Supabase and TikTok must allow the redirect URL. No client secret is used here.
 */
export async function openAuthSession(
  authUrl: string,
  redirectTo: string,
): Promise<AuthSessionResult> {
  const opened = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo);
  if (opened.type === 'success' && opened.url) {
    const callback = readOAuthCallback(opened.url);
    if (callback.kind === 'denied') {
      return { type: 'denied' };
    }
    return { type: 'success', url: opened.url };
  }
  if (opened.type === 'cancel' || opened.type === 'dismiss') {
    return { type: 'cancel' };
  }
  return { type: 'error' };
}
