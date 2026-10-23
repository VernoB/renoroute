export const BENCHMARK_CSV_RELATIVE_PATH = 'docs/research/benchmarks/measure_benchmarks.csv';
export const BENCHMARK_SEED_RELATIVE_PATH = 'docs/research/benchmarks/seed_measure_benchmarks.sql';
export const BENCHMARK_MIGRATION_RELATIVE_PATH =
  'supabase/migrations/0006_measure_benchmarks_seed.sql';

/** CSV `key` → existing `measure_code`. Variants share a code; province + cost_unit keep them unique. */
export const BENCHMARK_MEASURE_BY_KEY = {
  ductless_heat_pump: 'mini_split_heat_pump',
  ductless_heat_pump_nb: 'mini_split_heat_pump',
  multizone_ductless_heat_pump: 'mini_split_heat_pump',
  ducted_heat_pump: 'central_heat_pump',
  ducted_heat_pump_nb: 'central_heat_pump',
  ground_source_heat_pump: 'ground_source_heat_pump',
  attic_insulation: 'attic_insulation',
  air_sealing: 'air_sealing',
  windows: 'windows',
  exterior_door: 'doors',
  smart_thermostat: 'smart_thermostat',
  electrical_panel_upgrade: 'electrical_panel_upgrade',
  energuide_evaluation: 'pre_evaluation',
  drain_water_heat_recovery: 'drain_water_heat_recovery',
  solar_pv: 'solar_pv',
} as const;

export type BenchmarkCsvKey = keyof typeof BENCHMARK_MEASURE_BY_KEY;

export const COST_UNIT_BY_CSV_UNIT = {
  'per unit': 'unit',
  'per project': 'project',
  'per window': 'window',
  'per kW': 'kW',
} as const;

export const PROVINCE_BY_REGION = {
  'Canada-wide': 'CA',
  NB: 'NB',
  'Atlantic (NS/NB/PEI)': 'ATL',
} as const;

export type BenchmarkCsvRow = {
  key: BenchmarkCsvKey;
  nameEn: string;
  nameFr: string;
  costLowCad: number;
  costHighCad: number;
  unit: keyof typeof COST_UNIT_BY_CSV_UNIT;
  savingsPctLow: number | null;
  savingsPctHigh: number | null;
  sourceName: string;
  sourceUrl: string;
  excerpt: string;
  lastVerifiedAt: string;
  region: keyof typeof PROVINCE_BY_REGION;
  dataYear: string;
  notes: string;
};

const HEADER =
  'key,name_en,name_fr,cost_low_cad,cost_high_cad,unit,savings_pct_low,savings_pct_high,source_name,source_url,excerpt,last_verified_at,region,data_year,notes';

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"') {
      if (quoted && next === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (char === ',' && !quoted) {
      cells.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  cells.push(current);
  return cells;
}

function optionalNumber(value: string): number | null {
  if (value.trim() === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isCsvKey(value: string): value is BenchmarkCsvKey {
  return value in BENCHMARK_MEASURE_BY_KEY;
}

function isCsvUnit(value: string): value is keyof typeof COST_UNIT_BY_CSV_UNIT {
  return value in COST_UNIT_BY_CSV_UNIT;
}

function isRegion(value: string): value is keyof typeof PROVINCE_BY_REGION {
  return value in PROVINCE_BY_REGION;
}

export function parseBenchmarkCsv(raw: string): BenchmarkCsvRow[] {
  const lines = raw
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);
  const header = lines[0];
  if (header !== HEADER) {
    throw new Error('unexpected_benchmark_csv_header');
  }
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const key = cells[0] ?? '';
    const unit = cells[5] ?? '';
    const region = cells[12] ?? '';
    const sourceUrl = cells[9] ?? '';
    const lastVerifiedAt = cells[11] ?? '';
    const low = Number(cells[3]);
    const high = Number(cells[4]);
    if (!isCsvKey(key) || !isCsvUnit(unit) || !isRegion(region)) {
      throw new Error(`unexpected_benchmark_row:${key}`);
    }
    if (!sourceUrl.startsWith('https://') || !/^\d{4}-\d{2}-\d{2}$/.test(lastVerifiedAt)) {
      throw new Error(`missing_source:${key}`);
    }
    if (!Number.isFinite(low) || !Number.isFinite(high) || low > high) {
      throw new Error(`invalid_cost:${key}`);
    }
    return {
      key,
      nameEn: cells[1] ?? '',
      nameFr: cells[2] ?? '',
      costLowCad: low,
      costHighCad: high,
      unit,
      savingsPctLow: optionalNumber(cells[6] ?? ''),
      savingsPctHigh: optionalNumber(cells[7] ?? ''),
      sourceName: cells[8] ?? '',
      sourceUrl,
      excerpt: cells[10] ?? '',
      lastVerifiedAt,
      region,
      dataYear: cells[13] ?? '',
      notes: cells[14] ?? '',
    };
  });
}

export function mappedBenchmark(row: BenchmarkCsvRow) {
  return {
    province: PROVINCE_BY_REGION[row.region],
    measure: BENCHMARK_MEASURE_BY_KEY[row.key],
    costUnit: COST_UNIT_BY_CSV_UNIT[row.unit],
    isActive: false,
  };
}
