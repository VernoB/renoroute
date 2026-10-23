import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

test('auth-setup lists every app Brown must create and keeps secrets out of git', () => {
  const setup = readFileSync(path.join(repoRoot, 'docs/auth-setup.md'), 'utf8');
  const env = readFileSync(path.join(repoRoot, '.env.example'), 'utf8');
  for (const needle of [
    'Google Cloud',
    'Meta',
    'TikTok',
    'Sign in with Apple',
    'renoroute://auth/callback',
    '{SUPABASE_URL}/auth/v1/callback',
    'TIKTOK_CLIENT_SECRET',
    'BLOCKED: needs Brown keys',
  ]) {
    assert.match(setup, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(env, /EXPO_PUBLIC_FACEBOOK_APP_ID=replace-facebook-app-id/);
  assert.match(env, /EXPO_PUBLIC_TIKTOK_CLIENT_KEY=replace-tiktok-client-key/);
  assert.match(env, /TIKTOK_CLIENT_SECRET=replace-tiktok-client-secret/);
  assert.doesNotMatch(env, /sk_live_/);
  assert.doesNotMatch(setup, /sk_live_|TT[A-Za-z0-9]{20,}/);
});
