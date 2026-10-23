import * as Crypto from 'expo-crypto';

import {
  buildTiktokAuthorizeUrl,
  readOAuthCallback,
  type TikTokAuthorizeStart,
} from './social-sign-in';
import { openAuthSession } from './social-browser';

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

async function pkcePair(): Promise<{ verifier: string; challenge: string; state: string }> {
  const verifier = toBase64Url(await Crypto.getRandomBytesAsync(32));
  const state = toBase64Url(await Crypto.getRandomBytesAsync(16));
  const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, verifier, {
    encoding: Crypto.CryptoEncoding.BASE64,
  });
  const challenge = digest.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  return { verifier, challenge, state };
}

export async function startTikTokAuthorize(input: {
  clientKey: string;
  redirectTo: string;
}): Promise<TikTokAuthorizeStart> {
  const pkce = await pkcePair();
  const opened = await openAuthSession(
    buildTiktokAuthorizeUrl({
      clientKey: input.clientKey,
      redirectUri: input.redirectTo,
      state: pkce.state,
      codeChallenge: pkce.challenge,
    }),
    input.redirectTo,
  );
  if (opened.type === 'cancel') {
    return { type: 'cancel' };
  }
  if (opened.type === 'denied') {
    return { type: 'denied' };
  }
  if (opened.type !== 'success') {
    return { type: 'error' };
  }
  const callback = readOAuthCallback(opened.url);
  if (callback.kind !== 'code') {
    return { type: 'error' };
  }
  return { type: 'success', code: callback.code, codeVerifier: pkce.verifier };
}
