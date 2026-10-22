import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createChunkedStorage,
  supabaseAuthOptions,
  type KeyValueStore,
} from './session-storage.ts';

function memoryStore(): KeyValueStore {
  const values = new Map<string, string>();
  return {
    async getItem(key) {
      return values.get(key) ?? null;
    },
    async setItem(key, value) {
      values.set(key, value);
    },
    async removeItem(key) {
      values.delete(key);
    },
  };
}

test('a session larger than one SecureStore slot round-trips', async () => {
  const storage = createChunkedStorage(memoryStore());
  const session = `header.${'a'.repeat(5000)}.signature`;
  await storage.setItem('session', session);
  assert.equal(await storage.getItem('session'), session);
  await storage.removeItem('session');
  assert.equal(await storage.getItem('session'), null);
});

test('the Supabase client persists and refreshes the session', () => {
  assert.equal(supabaseAuthOptions.persistSession, true);
  assert.equal(supabaseAuthOptions.autoRefreshToken, true);
  assert.equal(supabaseAuthOptions.detectSessionInUrl, false);
});
