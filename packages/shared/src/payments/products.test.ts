import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { isPaymentProvider, PLAN_PRODUCTS, resolvePlanProduct } from './products.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

test('the catalog prices plan_49 and plan_99 in CAD cents', () => {
  assert.equal(PLAN_PRODUCTS.plan_49.amountCents, 4900);
  assert.equal(PLAN_PRODUCTS.plan_99.amountCents, 9900);
  assert.equal(PLAN_PRODUCTS.plan_49.currency, 'cad');
  assert.equal(PLAN_PRODUCTS.plan_99.currency, 'cad');
});

test('resolvePlanProduct ignores a client-sent amount', () => {
  const product = resolvePlanProduct({ productCode: 'plan_49', amountCents: 1 });
  assert.deepEqual(product, PLAN_PRODUCTS.plan_49);
  assert.equal(resolvePlanProduct({ productCode: 'plan_free' }), null);
  assert.equal(resolvePlanProduct({ productCode: 49 }), null);
});

test('only stripe and revenuecat are payment providers', () => {
  assert.equal(isPaymentProvider('stripe'), true);
  assert.equal(isPaymentProvider('revenuecat'), true);
  assert.equal(isPaymentProvider('apple'), false);
});

test('the payments migration records provider without inventing a published flag', () => {
  const sql = readFileSync(
    path.join(repoRoot, 'supabase/migrations/0007_payments_provider.sql'),
    'utf8',
  );
  assert.match(sql, /add column provider text not null default 'stripe'/);
  assert.match(sql, /check \(provider in \('stripe', 'revenuecat'\)\)/);
  assert.match(sql, /add column provider_event_id text/);
  assert.match(sql, /add column revenuecat_event_id text unique/);
  assert.equal(sql.includes('is_published'), false);
});
