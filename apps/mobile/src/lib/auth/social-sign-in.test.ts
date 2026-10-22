import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  readOAuthCallback,
  requiresAppleSignIn,
  signInWithSocial,
  socialProvidersFor,
  type SocialAuthPort,
  type SocialSignInInput,
} from './social-sign-in.ts';

const redirectTo = 'renoroute://auth/callback';

function port(overrides: Partial<SocialAuthPort> = {}): SocialAuthPort {
  return {
    async signInWithIdToken() {
      return { errorMessage: null };
    },
    async signInWithOAuth() {
      return { url: 'https://accounts.example/oauth', errorMessage: null, flowId: 'flow-1' };
    },
    async completeRedirect() {
      return { errorMessage: null };
    },
    ...overrides,
  };
}

function input(overrides: Partial<SocialSignInInput> = {}): SocialSignInInput {
  return {
    provider: 'google',
    platform: 'android',
    client: port(),
    config: { googleWebClientId: 'web.apps.googleusercontent.com' },
    redirectTo,
    openAuthSession: async () => ({ type: 'cancel' }),
    ...overrides,
  };
}

test('Apple sign-in is not required on Android', () => {
  assert.equal(requiresAppleSignIn('android'), false);
  assert.equal(requiresAppleSignIn('ios'), true);
  assert.deepEqual(socialProvidersFor('android'), ['google']);
  assert.deepEqual(socialProvidersFor('ios'), ['apple', 'google']);
});

test('a missing provider returns a typed failure and does not throw', async () => {
  const missingClient = await signInWithSocial(input({ client: null }));
  assert.deepEqual(missingClient, { ok: false, failure: 'unconfigured' });

  let called = false;
  const placeholder = await signInWithSocial(
    input({
      client: port({
        async signInWithOAuth() {
          called = true;
          return { url: null, errorMessage: 'Provider google is not enabled' };
        },
      }),
      config: { googleWebClientId: 'replace-google-web-client-id' },
    }),
  );
  assert.equal(called, false);
  assert.deepEqual(placeholder, { ok: false, failure: 'unconfigured' });
  assert.equal(JSON.stringify(placeholder).includes('not enabled'), false);
});

test('Apple is not started on Android even when a service id is present', async () => {
  let called = false;
  const result = await signInWithSocial(
    input({
      provider: 'apple',
      platform: 'android',
      config: { appleServiceId: 'ca.renoroute.signin' },
      client: port({
        async signInWithOAuth() {
          called = true;
          return { url: 'https://apple.example', errorMessage: null };
        },
      }),
    }),
  );
  assert.equal(called, false);
  assert.deepEqual(result, { ok: false, failure: 'unconfigured' });
});

test('provider errors stay a typed failure instead of an English message', async () => {
  const result = await signInWithSocial(
    input({
      client: port({
        async signInWithOAuth() {
          throw new Error('Provider google is not enabled');
        },
      }),
    }),
  );
  assert.deepEqual(result, { ok: false, failure: 'rejected' });
});

test('an id token uses signInWithIdToken and skips the browser', async () => {
  let seen = '';
  let oauth = false;
  const result = await signInWithSocial(
    input({
      provider: 'apple',
      platform: 'ios',
      config: { appleServiceId: 'ca.renoroute.signin' },
      idToken: { token: 'header.payload.sig', nonce: 'nonce-1' },
      client: port({
        async signInWithIdToken(credentials) {
          seen = `${credentials.token}:${credentials.nonce ?? ''}`;
          return { errorMessage: null };
        },
        async signInWithOAuth() {
          oauth = true;
          return { url: null, errorMessage: 'unused' };
        },
      }),
    }),
  );
  assert.deepEqual(result, { ok: true });
  assert.equal(seen, 'header.payload.sig:nonce-1');
  assert.equal(oauth, false);
});

test('oauth success exchanges the redirect without surfacing provider text', async () => {
  let completed = '';
  const result = await signInWithSocial(
    input({
      openAuthSession: async () => ({
        type: 'success',
        url: 'renoroute://auth/callback?code=abc',
      }),
      client: port({
        async completeRedirect(url, flowId) {
          completed = `${url}:${flowId ?? ''}`;
          return { errorMessage: null };
        },
      }),
    }),
  );
  assert.deepEqual(result, { ok: true });
  assert.equal(completed, 'renoroute://auth/callback?code=abc:flow-1');
});

test('oauth callbacks expose a code, tokens, or a typed error', () => {
  assert.deepEqual(readOAuthCallback('renoroute://auth/callback?code=abc'), {
    kind: 'code',
    code: 'abc',
  });
  assert.deepEqual(readOAuthCallback('renoroute://auth/callback#access_token=a&refresh_token=b'), {
    kind: 'tokens',
    accessToken: 'a',
    refreshToken: 'b',
  });
  assert.deepEqual(readOAuthCallback('renoroute://auth/callback?error=access_denied'), {
    kind: 'error',
  });
  assert.deepEqual(readOAuthCallback('renoroute://auth/callback'), { kind: 'missing' });
});
