import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  ADMIN_STALE_AFTER_DAYS,
  canPublishEnergyPrice,
  isVerificationStale,
  parseEnergyPriceInput,
  todayIsoDate,
} from './admin-catalog.ts';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../../..');

test('a verification older than 30 days is stale', () => {
  assert.equal(ADMIN_STALE_AFTER_DAYS, 30);
  const now = new Date('2026-10-23T12:00:00.000Z');
  assert.equal(isVerificationStale('2026-10-23', now), false);
  assert.equal(isVerificationStale('2026-09-22', now), true);
  assert.equal(isVerificationStale(null, now), true);
  assert.equal(todayIsoDate(now), '2026-10-23');
});

test('an energy price cannot be published without an https source', () => {
  assert.equal(canPublishEnergyPrice(null), false);
  assert.equal(canPublishEnergyPrice('http://example.com'), false);
  assert.equal(canPublishEnergyPrice('https://TODO-verify-official-url'), true);
  assert.equal(
    parseEnergyPriceInput({
      fuel: 'electricity',
      unit: 'kWh',
      sourceUrl: null,
      isPublished: true,
    }).ok,
    false,
  );
  const parsed = parseEnergyPriceInput({
    fuel: 'electricity',
    unit: 'kWh',
    sourceUrl: 'https://TODO-verify-official-url',
    isPublished: true,
  });
  assert.equal(parsed.ok, true);
});

test('reference writes stay admin-only and write the audit log', () => {
  const init = readFileSync(join(repoRoot, 'supabase/migrations/0001_init.sql'), 'utf8');
  const prices = readFileSync(join(repoRoot, 'supabase/migrations/0003_energy_prices.sql'), 'utf8');
  assert.match(init, /rebate_programs_admin_write[\s\S]*is_admin\(\)/);
  assert.match(init, /trg_audit_rebate_programs[\s\S]*audit_reference_change/);
  assert.match(init, /trg_audit_rebate_rules[\s\S]*audit_reference_change/);
  assert.match(init, /trg_audit_measure_benchmarks[\s\S]*audit_reference_change/);
  assert.match(prices, /energy_prices_admin_write[\s\S]*is_admin\(\)/);
  assert.match(prices, /trg_audit_energy_prices[\s\S]*audit_reference_change/);
});
