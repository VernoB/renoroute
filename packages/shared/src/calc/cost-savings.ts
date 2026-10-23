import { type EnergyPriceRow, selectEnergyPrice } from './energy-prices.ts';

export const COST_UNITS = ['project', 'sqft', 'window'] as const;
export type CostUnit = (typeof COST_UNITS)[number];
export type Confidence = 'low' | 'medium' | 'high';

export type MeasureBenchmarkRow = {
  province: string;
  measure: string;
  costLowCad: number;
  costHighCad: number;
  costUnit: string;
  savingsPctLow: number | null;
  savingsPctHigh: number | null;
  isActive: boolean;
};

export type HomeEnergyInput = {
  province: string;
  floorAreaSqft: number | null;
  windowCount: number | null;
  annualElectricityKwh: number | null;
  annualEnergyCostCad: number | null;
  asOfDate?: string;
};

export type RangeCad = {
  low: number;
  high: number;
};

export type MeasureEstimate = {
  measure: string;
  cost: RangeCad;
  annualSavingsCad: RangeCad | null;
  basis: string;
  confidence: Confidence;
  missing: string[];
};

const MISSING_LOW_FACTOR = 0.7;
const MISSING_HIGH_FACTOR = 1.5;

function roundCad(value: number): number {
  return Math.round(value * 100) / 100;
}

function sortedRange(low: number, high: number): RangeCad {
  const safeLow = Math.max(0, roundCad(low));
  const safeHigh = Math.max(safeLow, roundCad(high));
  return { low: safeLow, high: safeHigh };
}

function widenRange(range: RangeCad): RangeCad {
  return sortedRange(range.low * MISSING_LOW_FACTOR, range.high * MISSING_HIGH_FACTOR);
}

function isCostUnit(value: string): value is CostUnit {
  return (COST_UNITS as readonly string[]).includes(value);
}

function quantityForUnit(
  home: HomeEnergyInput,
  unit: CostUnit,
): { quantity: number | null; missing: string | null } {
  if (unit === 'project') {
    return { quantity: 1, missing: null };
  }
  if (unit === 'sqft') {
    return {
      quantity: home.floorAreaSqft,
      missing: home.floorAreaSqft === null ? 'floorAreaSqft' : null,
    };
  }
  return {
    quantity: home.windowCount,
    missing: home.windowCount === null ? 'windowCount' : null,
  };
}

function energyBaselineCad(
  home: HomeEnergyInput,
  energyPrices: readonly EnergyPriceRow[],
): { amount: number | null; missing: string[]; usedPublishedPrice: boolean } {
  if (home.annualEnergyCostCad !== null) {
    return { amount: home.annualEnergyCostCad, missing: [], usedPublishedPrice: false };
  }

  const asOf = home.asOfDate ?? '9999-12-31';
  const electricity = selectEnergyPrice(energyPrices, 'electricity', asOf);
  if (home.annualElectricityKwh !== null && electricity?.priceCad !== null && electricity) {
    return {
      amount: home.annualElectricityKwh * electricity.priceCad,
      missing: [],
      usedPublishedPrice: true,
    };
  }

  const missing: string[] = [];
  if (home.annualEnergyCostCad === null && home.annualElectricityKwh === null) {
    missing.push('annualEnergyCostCad');
  } else if (electricity?.priceCad == null) {
    missing.push('energyPrice');
  }
  return { amount: null, missing, usedPublishedPrice: false };
}

function savingsFromPct(
  baselineCad: number,
  pctLow: number | null,
  pctHigh: number | null,
): RangeCad | null {
  if (pctLow === null || pctHigh === null) {
    return null;
  }
  return sortedRange((baselineCad * pctLow) / 100, (baselineCad * pctHigh) / 100);
}

function confidenceFor(missing: readonly string[], usedPublishedPrice: boolean): Confidence {
  if (missing.length > 0) {
    return 'low';
  }
  if (usedPublishedPrice) {
    return 'medium';
  }
  return 'high';
}

/** Pure cost/savings ranges. Amounts come from benchmark rows, never from hardcoded NB rates. */
export function estimateMeasure(
  home: HomeEnergyInput,
  benchmark: MeasureBenchmarkRow,
  energyPrices: readonly EnergyPriceRow[] = [],
): MeasureEstimate | null {
  if (!benchmark.isActive || benchmark.province !== home.province) {
    return null;
  }
  if (!Number.isFinite(benchmark.costLowCad) || !Number.isFinite(benchmark.costHighCad)) {
    return null;
  }
  if (benchmark.costLowCad > benchmark.costHighCad) {
    return null;
  }

  const missing: string[] = [];
  const unit: CostUnit = isCostUnit(benchmark.costUnit) ? benchmark.costUnit : 'project';
  if (!isCostUnit(benchmark.costUnit)) {
    missing.push('costUnit');
  }
  const { quantity, missing: quantityMissing } = quantityForUnit(home, unit);
  if (quantityMissing) {
    missing.push(quantityMissing);
  }

  const unitCost = sortedRange(benchmark.costLowCad, benchmark.costHighCad);
  const scaled =
    quantity === null ? unitCost : sortedRange(unitCost.low * quantity, unitCost.high * quantity);
  const cost = missing.length > 0 ? widenRange(scaled) : scaled;

  const baseline = energyBaselineCad(home, energyPrices);
  missing.push(...baseline.missing);

  let annualSavingsCad: RangeCad | null = null;
  if (benchmark.savingsPctLow === null || benchmark.savingsPctHigh === null) {
    missing.push('savingsPct');
  } else if (baseline.amount === null) {
    annualSavingsCad = null;
  } else {
    const savings = savingsFromPct(
      baseline.amount,
      benchmark.savingsPctLow,
      benchmark.savingsPctHigh,
    );
    annualSavingsCad = baseline.missing.length > 0 && savings ? widenRange(savings) : savings;
  }

  if (annualSavingsCad && missing.length > 0 && baseline.amount !== null) {
    annualSavingsCad = widenRange(annualSavingsCad);
  }

  return {
    measure: benchmark.measure,
    cost,
    annualSavingsCad,
    basis: `benchmark:${benchmark.province}:${benchmark.measure}`,
    confidence: confidenceFor(missing, baseline.usedPublishedPrice),
    missing,
  };
}

export function estimateCandidateMeasures(
  home: HomeEnergyInput,
  benchmarks: readonly MeasureBenchmarkRow[],
  energyPrices: readonly EnergyPriceRow[] = [],
): MeasureEstimate[] {
  return benchmarks
    .map((row) => estimateMeasure(home, row, energyPrices))
    .filter((row): row is MeasureEstimate => row !== null);
}
