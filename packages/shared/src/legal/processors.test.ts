import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { BRAND } from '../config/brand.ts';
import { legalContactEmail, legalPageUrl, PROCESSORS, RETENTION } from './processors.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

function landing(name: string): string {
  return readFileSync(path.join(repoRoot, 'apps/landing', name), 'utf8');
}

test('the draft lists processors, countries, retention, and a contact', () => {
  assert.equal(
    PROCESSORS.some((row) => row.name === 'Supabase' && row.country === 'CA'),
    true,
  );
  assert.equal(
    PROCESSORS.some((row) => row.name === 'Stripe' && row.country === 'US'),
    true,
  );
  assert.equal(RETENTION.waitlistMonths, 24);
  assert.equal(RETENTION.paymentsYears, 6);
  assert.equal(legalContactEmail(), BRAND.supportEmail);
});

test('privacy and terms pages exist in the landing and stay marked as drafts', () => {
  const privacy = landing('privacy.html');
  const terms = landing('terms.html');
  const catalog = landing('i18n.js');
  assert.match(privacy, /data-i18n="pp.draft"/);
  assert.match(terms, /data-i18n="tos.draft"/);
  assert.match(catalog, /pp\.processors/);
  assert.match(catalog, /tos\.h1/);
  for (const row of PROCESSORS) {
    assert.match(catalog, new RegExp(row.name));
  }
  assert.match(catalog, /24 mois|24 months/);
  assert.match(catalog, /{{contactEmail}}/);
});

test('legalPageUrl points at the landing files', () => {
  assert.equal(legalPageUrl('privacy', 'https://example.com'), 'https://example.com/privacy.html');
  assert.equal(legalPageUrl('terms', 'https://example.com/'), 'https://example.com/terms.html');
});
