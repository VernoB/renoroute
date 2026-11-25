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
  assert.equal(provinceCoverage('NS').level, 'full');
  assert.equal(provinceCoverage('NS').utilitiesVerified, true);
  assert.equal(provinceCoverage('NS').rebatesPublished, true);
  assert.equal(provinceCoverage('ON').utilitiesVerified, false);
  assert.equal(coverageLevel(null), 'federal_only');
});

test('Nova Scotia publish keeps the sourced cent rates and the coverage record', () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
  const draft = readFileSync(
    path.join(repoRoot, 'supabase/migrations/0010_ns_power_draft.sql'),
    'utf8',
  );
  const published = readFileSync(
    path.join(repoRoot, 'supabase/migrations/0011_publish_ns.sql'),
    'utf8',
  );
  assert.match(draft, /18\.324/);
  assert.match(draft, /19\.067/);
  assert.match(published, /price_cad = 18\.324 and effective_from is null/);
  assert.match(published, /price_cad = 19\.067 and effective_from = '2027-01-01'/);
  assert.match(published, /2026-11-22/);
  assert.match(
    published,
    /https:\/\/www\.nspower\.ca\/docs\/default-source\/regulatory\/tariff-book-2026\.pdf/,
  );
  assert.equal(published.includes('0.18324'), false);
  assert.match(published, /name_fr_is_translation/);
  assert.match(published, /status = 'announced'/);
  const nsPower = UTILITY_COVERAGE.find((row) => row.code === 'nova_scotia_power');
  assert.equal(nsPower?.published, true);
  assert.equal(nsPower?.province, 'NS');
  assert.equal(provinceCoverage('NS').level, 'full');
  assert.equal(provinceCoverage('NS').utilitiesVerified, provinceCoverage('NS').rebatesPublished);
});

test('affiliation copy stays NB Power for New Brunswick', () => {
  assert.equal(affiliationCopyKey('NB'), 'legal.notAffiliatedNb');
  assert.equal(affiliationCopyKey('NS'), 'legal.notAffiliatedNs');
  assert.equal(affiliationCopyKey('ON'), 'legal.notAffiliatedNational');
  assert.equal(affiliationCopyKey(null), 'legal.notAffiliatedNational');
});
