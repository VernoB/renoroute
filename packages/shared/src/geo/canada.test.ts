import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  affiliationCopyKey,
  CANADIAN_PROVINCES,
  coverageLevel,
  suggestProvinceFromPostal,
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

test('NB and NS are fully supported and other provinces stay federal-only', () => {
  assert.equal(coverageLevel('NB'), 'full');
  assert.equal(coverageLevel('NS'), 'full');
  assert.equal(coverageLevel('ON'), 'federal_only');
  assert.equal(coverageLevel(null), 'federal_only');
});

test('affiliation copy stays NB Power for New Brunswick', () => {
  assert.equal(affiliationCopyKey('NB'), 'legal.notAffiliatedNb');
  assert.equal(affiliationCopyKey('NS'), 'legal.notAffiliatedNs');
  assert.equal(affiliationCopyKey('ON'), 'legal.notAffiliatedNational');
  assert.equal(affiliationCopyKey(null), 'legal.notAffiliatedNational');
});
