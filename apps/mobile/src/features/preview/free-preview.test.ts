import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { MeasureBenchmarkRow } from '../../../../../packages/shared/src/calc/cost-savings.ts';
import type { HomeInput } from '../../../../../packages/shared/src/home/home-input.ts';

import {
  benchmarkFromDbRow,
  buildFreePreview,
  freePreviewView,
  totalCostRange,
  totalSavingsRange,
} from './free-preview.ts';

const home: Partial<HomeInput> = {
  province: 'NB',
  floorAreaSqft: 1400,
  annualEnergyCostCad: 3600,
};

const airSealing: MeasureBenchmarkRow = {
  province: 'NB',
  measure: 'air_sealing',
  costLowCad: 400,
  costHighCad: 1200,
  costUnit: 'project',
  savingsPctLow: 5,
  savingsPctHigh: 12,
  isActive: true,
};

test('buildFreePreview uses the calculator and keeps at most three measures', () => {
  const estimates = buildFreePreview(home, [
    airSealing,
    { ...airSealing, measure: 'windows', costLowCad: 800, costHighCad: 1400, costUnit: 'window' },
    { ...airSealing, measure: 'smart_thermostat', costLowCad: 200, costHighCad: 400 },
    { ...airSealing, measure: 'doors', costLowCad: 900, costHighCad: 1600 },
  ]);
  assert.equal(estimates.length, 3);
  assert.deepEqual(
    estimates.map((row) => row.measure),
    ['windows', 'smart_thermostat', 'air_sealing'],
  );
  const view = freePreviewView(home, [airSealing]);
  assert.deepEqual(view.totalCost, { low: 400, high: 1200 });
  assert.ok(view.totalSavings && view.totalSavings.low > 0);
  assert.ok(totalCostRange(estimates) && totalSavingsRange(estimates));
});

test('inactive or other-province benchmarks do not appear', () => {
  assert.deepEqual(buildFreePreview(home, [{ ...airSealing, isActive: false }]), []);
  assert.deepEqual(buildFreePreview(home, [{ ...airSealing, province: 'CA' }]), []);
  assert.equal(totalCostRange([]), null);
  assert.equal(totalSavingsRange([]), null);
});

test('benchmarkFromDbRow maps published rows and drops incomplete ones', () => {
  assert.deepEqual(
    benchmarkFromDbRow({
      province: 'NB',
      measure: 'air_sealing',
      cost_low_cad: 400,
      cost_high_cad: 1200,
      cost_unit: 'project',
      savings_pct_low: 5,
      savings_pct_high: 12,
      is_active: true,
    }),
    airSealing,
  );
  assert.equal(benchmarkFromDbRow({ measure: 'air_sealing', is_active: true }), null);
  assert.equal(
    benchmarkFromDbRow({
      measure: 'air_sealing',
      cost_low_cad: 400,
      cost_high_cad: 1200,
      is_active: false,
    })?.isActive,
    false,
  );
});
