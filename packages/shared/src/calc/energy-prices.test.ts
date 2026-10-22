import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { selectEnergyPrice, type EnergyPriceRow } from './energy-prices.ts';

const published: EnergyPriceRow = {
  fuel: 'electricity',
  unit: 'kWh',
  priceCad: 1,
  effectiveFrom: '2024-01-01',
  isPublished: true,
};

test('selectEnergyPrice ignores unpublished rows and missing amounts', () => {
  const selected = selectEnergyPrice(
    [
      { ...published, isPublished: false, priceCad: 9 },
      { ...published, priceCad: null },
      published,
    ],
    'electricity',
    '2025-01-01',
  );
  assert.equal(selected?.priceCad, 1);
  assert.equal(selected?.effectiveFrom, '2024-01-01');
});

test('selectEnergyPrice keeps the latest published row on or before the date', () => {
  const selected = selectEnergyPrice(
    [
      published,
      { ...published, priceCad: 2, effectiveFrom: '2025-06-01' },
      { ...published, priceCad: 3, effectiveFrom: '2026-01-01' },
    ],
    'electricity',
    '2025-12-01',
  );
  assert.equal(selected?.priceCad, 2);
});

test('selectEnergyPrice does not embed a rate for another fuel', () => {
  assert.equal(selectEnergyPrice([published], 'propane', '2025-01-01'), null);
});

test('the calculator source does not contain a market rate', () => {
  const source = readFileSync(
    fileURLToPath(new URL('./energy-prices.ts', import.meta.url)),
    'utf8',
  );
  assert.equal(source.includes('0.'), false);
});
