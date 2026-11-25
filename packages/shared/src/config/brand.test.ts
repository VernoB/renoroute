import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { BRAND } from './brand.ts';

const ACCENTED_PRODUCT_NAME = 'RénoRoute';

test('BRAND is the only product-identifier contract', () => {
  assert.equal(BRAND.slug, 'renoroute');
  assert.equal(BRAND.scheme, 'renoroute');
  assert.ok(BRAND.name.length > 0);
  assert.equal(BRAND.androidPackage, BRAND.iosBundleId);
  assert.match(BRAND.iosBundleId, /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/);
  assert.equal(typeof BRAND.supportEmail, 'string');
  assert.equal(typeof BRAND.legalEntity, 'string');
  assert.equal(typeof BRAND.websiteUrl, 'string');
  assert.equal(BRAND.name, 'RenoRoute');
});

test('i18n catalogs and the Expo config never use the accented product name', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
  const files = [
    'packages/shared/src/i18n/fr.json',
    'packages/shared/src/i18n/en.json',
    'apps/mobile/app.config.ts',
  ];
  for (const file of files) {
    const text = readFileSync(path.join(root, file), 'utf8');
    assert.equal(text.includes(ACCENTED_PRODUCT_NAME), false, file);
  }
});
