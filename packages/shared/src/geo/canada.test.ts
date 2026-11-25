import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  affiliationCopyKey,
  CANADIAN_PROVINCES,
  coverageLevel,
  FULLY_SUPPORTED_PROVINCES,
  provinceCoverage,
  suggestProvinceFromPostal,
  UTILITY_COVERAGE,
} from './canada.ts';

test('postal first letters suggest NB and NS and never a GPS result', () => {
  assert.equal(suggestProvinceFromPostal('E1C'), 'NB');
  assert.equal(suggestProvinceFromPostal('b3h'), 'NS');
  assert.equal(suggestProvinceFromPostal('C1A'), 'PE');
  assert.equal(suggestProvinceFromPostal('Y1A'), 'YT');
  assert.equal(suggestProvinceFromPostal('X0A'), null);
  assert.equal(suggestProvinceFromPostal(''), null);
  assert.equal(CANADIAN_PROVINCES.length, 13);
});

test('the coverage badge and the utility note come from one record', () => {
  for (const code of CANADIAN_PROVINCES) {
    const coverage = provinceCoverage(code);
    assert.equal(coverageLevel(code), coverage.level);
    assert.equal(
      (FULLY_SUPPORTED_PROVINCES as readonly string[]).includes(code),
      coverage.level === 'full',
    );
    if (coverage.level === 'full') {
      assert.equal(coverage.utilitiesVerified, true);
      assert.equal(coverage.rebatesPublished, true);
    }
  }
  assert.equal(provinceCoverage('NB').level, 'full');
  assert.equal(provinceCoverage('NS').level, 'federal_only');
  assert.equal(provinceCoverage('NS').utilitiesVerified, false);
  assert.equal(provinceCoverage('ON').utilitiesVerified, false);
  assert.equal(coverageLevel(null), 'federal_only');
});

test('Nova Scotia Power rates stay unpublished drafts, so the badge cannot say fully covered', () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
  const sql = readFileSync(
    path.join(repoRoot, 'supabase/migrations/0010_ns_power_draft.sql'),
    'utf8',
  );
  assert.match(sql, /nova_scotia_power/);
  assert.match(sql, /18\.324/);
  assert.match(sql, /19\.067/);
  assert.match(sql, /2027-01-01/);
  assert.match(sql, /2026-11-22/);
  assert.match(
    sql,
    /https:\/\/www\.nspower\.ca\/docs\/default-source\/regulatory\/tariff-book-2026\.pdf/,
  );
  assert.equal(sql.includes('is_published, true'), false);
  assert.equal(sql.split('\n').filter((line) => line.trim() === 'false').length >= 2, true);
  const nsPower = UTILITY_COVERAGE.find((row) => row.code === 'nova_scotia_power');
  assert.equal(nsPower?.published, false);
  assert.equal(nsPower?.province, 'NS');
  assert.equal(provinceCoverage('NS').level, 'federal_only');
});

test('affiliation copy stays NB Power for New Brunswick', () => {
  assert.equal(affiliationCopyKey('NB'), 'legal.notAffiliatedNb');
  assert.equal(affiliationCopyKey('NS'), 'legal.notAffiliatedNs');
  assert.equal(affiliationCopyKey('ON'), 'legal.notAffiliatedNational');
  assert.equal(affiliationCopyKey(null), 'legal.notAffiliatedNational');
});
