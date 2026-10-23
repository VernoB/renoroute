import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { type EnergyPriceRow } from './energy-prices.ts';
import {
  estimateCandidateMeasures,
  estimateMeasure,
  type HomeEnergyInput,
  type MeasureBenchmarkRow,
} from './cost-savings.ts';

const completeHome: HomeEnergyInput = {
  province: 'NB',
  floorAreaSqft: 1400,
  windowCount: 10,
  annualElectricityKwh: 24000,
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

const attic: MeasureBenchmarkRow = {
  ...airSealing,
  measure: 'attic_insulation',
  costLowCad: 2,
  costHighCad: 4,
  costUnit: 'sqft',
  savingsPctLow: 10,
  savingsPctHigh: 20,
};

const windows: MeasureBenchmarkRow = {
  ...airSealing,
  measure: 'windows',
  costLowCad: 800,
  costHighCad: 1400,
  costUnit: 'window',
  savingsPctLow: 3,
  savingsPctHigh: 8,
};

const publishedElectricity: EnergyPriceRow = {
  fuel: 'electricity',
  unit: 'kWh',
  priceCad: 0.15,
  effectiveFrom: '2024-01-01',
  isPublished: true,
};

test('project unit uses the benchmark range and declared energy cost', () => {
  const estimate = estimateMeasure(completeHome, airSealing);
  assert.deepEqual(estimate, {
    measure: 'air_sealing',
    cost: { low: 400, high: 1200 },
    annualSavingsCad: { low: 180, high: 432 },
    basis: 'benchmark:NB:air_sealing',
    confidence: 'high',
    missing: [],
  });
});

test('sqft and window units scale with known quantities', () => {
  const atticEstimate = estimateMeasure(completeHome, attic);
  assert.deepEqual(atticEstimate?.cost, { low: 2800, high: 5600 });
  assert.equal(atticEstimate?.confidence, 'high');

  const windowEstimate = estimateMeasure(completeHome, windows);
  assert.deepEqual(windowEstimate?.cost, { low: 8000, high: 14000 });
});

test('missing quantity widens the cost range and sets confidence low', () => {
  const estimate = estimateMeasure({ ...completeHome, floorAreaSqft: null }, attic);
  assert.equal(estimate?.confidence, 'low');
  assert.deepEqual(estimate?.missing.includes('floorAreaSqft'), true);
  assert.ok(estimate && estimate.cost.low < 2);
  assert.ok(estimate && estimate.cost.high > 4);
});

test('missing energy data widens savings to low confidence or omits dollars', () => {
  const estimate = estimateMeasure(
    { ...completeHome, annualEnergyCostCad: null, annualElectricityKwh: null },
    airSealing,
  );
  assert.equal(estimate?.confidence, 'low');
  assert.equal(estimate?.annualSavingsCad, null);
  assert.ok(estimate?.missing.includes('annualEnergyCostCad'));
  assert.deepEqual(estimate?.cost, { low: 400, high: 1200 });
});

test('published electricity price fills savings when the bill is missing', () => {
  const estimate = estimateMeasure(
    { ...completeHome, annualEnergyCostCad: null, asOfDate: '2026-01-01' },
    airSealing,
    [publishedElectricity],
  );
  assert.deepEqual(estimate?.annualSavingsCad, { low: 180, high: 432 });
  assert.equal(estimate?.confidence, 'medium');
  assert.deepEqual(estimate?.missing, []);
});

test('unpublished energy prices are not used as a fallback', () => {
  const estimate = estimateMeasure(
    { ...completeHome, annualEnergyCostCad: null, asOfDate: '2026-01-01' },
    airSealing,
    [{ ...publishedElectricity, isPublished: false }],
  );
  assert.equal(estimate?.annualSavingsCad, null);
  assert.equal(estimate?.confidence, 'low');
  assert.ok(estimate?.missing.includes('energyPrice'));
});

test('inactive or other-province benchmarks are ignored', () => {
  assert.equal(estimateMeasure(completeHome, { ...airSealing, isActive: false }), null);
  assert.equal(estimateMeasure(completeHome, { ...airSealing, province: 'NS' }), null);
});

test('unknown cost units widen the project range at low confidence', () => {
  const estimate = estimateMeasure(completeHome, { ...airSealing, costUnit: 'TODO(verify)' });
  assert.equal(estimate?.confidence, 'low');
  assert.ok(estimate?.missing.includes('costUnit'));
  assert.ok(estimate && estimate.cost.low < 400);
  assert.ok(estimate && estimate.cost.high > 1200);
});

test('estimateCandidateMeasures keeps only usable rows', () => {
  const estimates = estimateCandidateMeasures(completeHome, [
    airSealing,
    { ...attic, isActive: false },
    { ...windows, province: 'QC' },
  ]);
  assert.deepEqual(
    estimates.map((row) => row.measure),
    ['air_sealing'],
  );
});

test('the calculator does not embed a New Brunswick market rate', () => {
  const source = readFileSync(fileURLToPath(new URL('./cost-savings.ts', import.meta.url)), 'utf8');
  assert.equal(source.includes('0.128'), false);
  assert.equal(source.includes('0.13'), false);
  assert.equal(source.includes('NB Power'), false);
});
