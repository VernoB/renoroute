import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  DEFAULT_PLAN_PRODUCT_CODE,
  isPaymentProvider,
  PLAN_PRODUCT_CODES,
  PLAN_PRODUCTS,
  resolvePlanProduct,
} from './products.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

test('the catalog prices standard and premium in CAD cents, not in the product id', () => {
  assert.deepEqual(PLAN_PRODUCT_CODES, ['renoroute_plan_standard', 'renoroute_plan_premium']);
  assert.equal(PLAN_PRODUCTS.renoroute_plan_standard.amountCents, 4900);
  assert.equal(PLAN_PRODUCTS.renoroute_plan_premium.amountCents, 9900);
  assert.equal(PLAN_PRODUCTS.renoroute_plan_standard.currency, 'cad');
  for (const code of PLAN_PRODUCT_CODES) {
    assert.equal(/\d/.test(code), false, `${code} must not embed a price`);
  }
});

test('resolvePlanProduct ignores a client-sent amount', () => {
  const product = resolvePlanProduct({
    productCode: 'renoroute_plan_standard',
    amountCents: 1,
  });
  assert.deepEqual(product, PLAN_PRODUCTS.renoroute_plan_standard);
  assert.equal(resolvePlanProduct({ productCode: 'plan_49' }), null);
  assert.equal(resolvePlanProduct({ productCode: 'plan_free' }), null);
});

test('only stripe and revenuecat are payment providers', () => {
  assert.equal(isPaymentProvider('stripe'), true);
  assert.equal(isPaymentProvider('revenuecat'), true);
  assert.equal(isPaymentProvider('apple'), false);
  assert.equal(DEFAULT_PLAN_PRODUCT_CODE, 'renoroute_plan_standard');
});

test('env example documents the store product ids and no live price ids', () => {
  const env = readFileSync(path.join(repoRoot, '.env.example'), 'utf8');
  assert.match(env, /renoroute_plan_standard/);
  assert.match(env, /renoroute_plan_premium/);
  assert.match(env, /BLOCKED: needs Brown keys/);
  assert.equal(env.includes('STRIPE_PRICE_PLAN'), false);
  assert.equal(env.includes('sk_live_'), false);
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
