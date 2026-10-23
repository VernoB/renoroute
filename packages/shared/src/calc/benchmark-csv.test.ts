import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { MEASURE_CODES } from '../home/enums.ts';
import {
  BENCHMARK_CSV_RELATIVE_PATH,
  BENCHMARK_MEASURE_BY_KEY,
  BENCHMARK_MIGRATION_RELATIVE_PATH,
  BENCHMARK_SEED_RELATIVE_PATH,
  mappedBenchmark,
  parseBenchmarkCsv,
} from './benchmark-csv.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

function readRepo(relativePath: string): string {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('the CSV is the only seed source and every row has a source', () => {
  const rows = parseBenchmarkCsv(readRepo(BENCHMARK_CSV_RELATIVE_PATH));
  assert.equal(rows.length, 15);
  assert.ok(rows.length >= 10);
  for (const row of rows) {
    assert.match(row.sourceUrl, /^https:\/\//);
    assert.match(row.lastVerifiedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(Object.hasOwn(BENCHMARK_MEASURE_BY_KEY, row.key), true);
  }
});

test('the aligned seed uses 0001 columns and stays unpublished', () => {
  const seed = readRepo(BENCHMARK_SEED_RELATIVE_PATH);
  const migration = readRepo(BENCHMARK_MIGRATION_RELATIVE_PATH);
  const insert = seed.slice(seed.indexOf('insert into public.measure_benchmarks'));
  assert.ok(migration.includes(insert));
  assert.match(seed, /province, measure, cost_low_cad, cost_high_cad, cost_unit/);
  assert.equal(seed.includes('name_en,'), false);
  assert.match(seed, /\bis_active\b/);
  assert.equal(/insert into public\.measure_benchmarks \([^)]*is_published/.test(seed), false);
  assert.equal((seed.match(/, false\n/g) ?? []).length, 15);
  assert.equal(seed.includes(', true'), false);
});

test('the seed keeps every CSV source and adds no extra measure keys', () => {
  const rows = parseBenchmarkCsv(readRepo(BENCHMARK_CSV_RELATIVE_PATH));
  const seed = readRepo(BENCHMARK_SEED_RELATIVE_PATH);
  const keys = [...seed.matchAll(/"csv_key":"([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(keys.sort(), rows.map((row) => row.key).sort());
  for (const row of rows) {
    assert.ok(seed.includes(row.sourceUrl), row.key);
    assert.ok(seed.includes(row.lastVerifiedAt), row.key);
    const mapped = mappedBenchmark(row);
    assert.ok((MEASURE_CODES as readonly string[]).includes(mapped.measure));
    assert.equal(mapped.isActive, false);
  }
});
