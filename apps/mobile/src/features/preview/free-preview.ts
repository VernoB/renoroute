import {
  estimateCandidateMeasures,
  type HomeEnergyInput,
  type MeasureBenchmarkRow,
  type MeasureEstimate,
} from '../../../../../packages/shared/src/calc/cost-savings.ts';
import type { HomeInput } from '../../../../../packages/shared/src/home/home-input.ts';

const PREVIEW_MEASURE_LIMIT = 3;

export type FreePreviewView = {
  estimates: MeasureEstimate[];
  totalCost: { low: number; high: number } | null;
  totalSavings: { low: number; high: number } | null;
};

export function homeToEnergyInput(home: Partial<HomeInput>): HomeEnergyInput {
  return {
    province: home.province ?? 'NB',
    floorAreaSqft: home.floorAreaSqft ?? null,
    windowCount: null,
    annualElectricityKwh: home.annualElectricityKwh ?? null,
    annualEnergyCostCad: home.annualEnergyCostCad ?? null,
  };
}

export function buildFreePreview(
  home: Partial<HomeInput>,
  benchmarks: readonly MeasureBenchmarkRow[],
): MeasureEstimate[] {
  return estimateCandidateMeasures(homeToEnergyInput(home), benchmarks)
    .sort(comparePreviewPriority)
    .slice(0, PREVIEW_MEASURE_LIMIT);
}

export function freePreviewView(
  home: Partial<HomeInput>,
  benchmarks: readonly MeasureBenchmarkRow[],
): FreePreviewView {
  const estimates = buildFreePreview(home, benchmarks);
  return {
    estimates,
    totalCost: totalCostRange(estimates),
    totalSavings: totalSavingsRange(estimates),
  };
}

export function totalCostRange(estimates: readonly MeasureEstimate[]): {
  low: number;
  high: number;
} | null {
  if (estimates.length === 0) {
    return null;
  }
  return estimates.reduce(
    (sum, row) => ({ low: sum.low + row.cost.low, high: sum.high + row.cost.high }),
    { low: 0, high: 0 },
  );
}

export function totalSavingsRange(estimates: readonly MeasureEstimate[]): {
  low: number;
  high: number;
} | null {
  const withSavings = estimates.filter((row) => row.annualSavingsCad !== null);
  if (withSavings.length === 0) {
    return null;
  }
  return withSavings.reduce(
    (sum, row) => ({
      low: sum.low + (row.annualSavingsCad?.low ?? 0),
      high: sum.high + (row.annualSavingsCad?.high ?? 0),
    }),
    { low: 0, high: 0 },
  );
}

export function benchmarkFromDbRow(row: unknown): MeasureBenchmarkRow | null {
  if (typeof row !== 'object' || row === null) {
    return null;
  }
  const value = row as Record<string, unknown>;
  if (
    typeof value.measure !== 'string' ||
    typeof value.cost_low_cad !== 'number' ||
    typeof value.cost_high_cad !== 'number'
  ) {
    return null;
  }
  return {
    province: typeof value.province === 'string' ? value.province : 'NB',
    measure: value.measure,
    costLowCad: value.cost_low_cad,
    costHighCad: value.cost_high_cad,
    costUnit: typeof value.cost_unit === 'string' ? value.cost_unit : 'project',
    savingsPctLow: typeof value.savings_pct_low === 'number' ? value.savings_pct_low : null,
    savingsPctHigh: typeof value.savings_pct_high === 'number' ? value.savings_pct_high : null,
    isActive: value.is_active === true,
  };
}

function comparePreviewPriority(left: MeasureEstimate, right: MeasureEstimate): number {
  const leftSave = left.annualSavingsCad?.high ?? -1;
  const rightSave = right.annualSavingsCad?.high ?? -1;
  if (rightSave !== leftSave) {
    return rightSave - leftSave;
  }
  return left.cost.low - right.cost.low;
}
