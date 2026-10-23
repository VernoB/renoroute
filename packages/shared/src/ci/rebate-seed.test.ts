import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const seed = readFileSync(path.join(repoRoot, 'supabase/seed.sql'), 'utf8');

const slugs = [
  'nbp-total-home-energy-savings',
  'nbp-enhanced-energy-savings',
  'ca-greener-homes-loan',
  'ca-national-heat-pump-rebate',
  'sje-heat-pump-rental-financing',
];

test('seed.sql lists the five known programs unpublished', () => {
  for (const slug of slugs) {
    assert.match(seed, new RegExp(`'${slug}'`));
  }
  const unpublished = seed.match(/'https:\/\/TODO-verify-official-url', '2026-10-19', false/g) ?? [];
  assert.ok(unpublished.length >= slugs.length);
  assert.doesNotMatch(seed, /is_published\s*=\s*true/);
});

test('seed.sql never invents an official program URL', () => {
  assert.match(seed, /https:\/\/TODO-verify-official-url/);
  assert.doesNotMatch(seed, /nbpower\.com/i);
  assert.doesNotMatch(seed, /canada\.ca/i);
  assert.doesNotMatch(seed, /sjenergy\.com/i);
});
