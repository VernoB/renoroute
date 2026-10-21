import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  liveStripeKeys,
  placeholderCovers,
  PLACEHOLDER_SECRET_PATTERNS,
} from './env-example-secrets.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

function readRepoFile(name: string): string {
  return readFileSync(path.join(repoRoot, name), 'utf8');
}

describe('env example secrets', () => {
  it('does not path-allowlist .env.example', () => {
    const config = readRepoFile('.gitleaks.toml');
    assert.equal(config.includes('.env.example'), false);
    for (const pattern of PLACEHOLDER_SECRET_PATTERNS) {
      assert.equal(config.includes(pattern.source), true, pattern.source);
    }
  });

  it('fails when a live Stripe key is pasted into .env.example', () => {
    assert.deepEqual(liveStripeKeys(readRepoFile('.env.example')), []);
  });

  it('does not treat a live Stripe key as a placeholder', () => {
    const key = ['sk', 'live', '51H' + 'a'.repeat(24)].join('_');
    assert.equal(placeholderCovers(key), false);
    assert.deepEqual(liveStripeKeys(`STRIPE_SECRET_KEY=${key}`), [key]);
  });
});
