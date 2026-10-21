import assert from 'node:assert/strict';
import { test } from 'node:test';

import { BRAND } from './brand.ts';

test('BRAND is the only product-identifier contract', () => {
  assert.equal(BRAND.slug, 'renoroute');
  assert.equal(BRAND.scheme, 'renoroute');
  assert.ok(BRAND.name.length > 0);
  assert.equal(BRAND.androidPackage, BRAND.iosBundleId);
  assert.match(BRAND.iosBundleId, /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/);
  assert.equal(typeof BRAND.supportEmail, 'string');
  assert.equal(typeof BRAND.legalEntity, 'string');
  assert.equal(typeof BRAND.websiteUrl, 'string');
});
