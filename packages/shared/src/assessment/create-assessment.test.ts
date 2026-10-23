import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseCreateAssessment } from './create-assessment.ts';

const completeHome = {
  homeType: 'detached' as const,
  yearBuilt: 1978,
  heatingPrimary: 'electric_baseboard' as const,
  electricUtility: 'nb_power' as const,
};

const consentAiAt = '2026-10-22T18:00:00.000Z';

test('refuses a draft without AI consent', () => {
  const parsed = parseCreateAssessment({
    consentAiAt: null,
    home: completeHome,
    locale: 'fr',
    photoCount: 2,
  });
  assert.deepEqual(parsed, { ok: false, reason: 'no_consent' });
});

test('refuses an empty consent timestamp', () => {
  const parsed = parseCreateAssessment({
    consentAiAt: '',
    home: completeHome,
    locale: 'en',
    photoCount: 1,
  });
  assert.equal(parsed.ok, false);
  if (!parsed.ok) {
    assert.equal(parsed.reason, 'no_consent');
  }
});

test('creates a French draft when the home and photos are complete', () => {
  const parsed = parseCreateAssessment({
    consentAiAt,
    home: completeHome,
    locale: 'fr',
    photoCount: 3,
  });
  assert.deepEqual(parsed, { ok: true, status: 'draft', missing: false, locale: 'fr' });
});

test('creates an English draft and flags a missing intake', () => {
  const parsed = parseCreateAssessment({
    consentAiAt,
    home: { electricUtility: 'nb_power' },
    locale: 'en',
    photoCount: 2,
  });
  assert.deepEqual(parsed, { ok: true, status: 'draft', missing: true, locale: 'en' });
});

test('flags missing when there are no photos', () => {
  const parsed = parseCreateAssessment({
    consentAiAt,
    home: completeHome,
    locale: 'fr',
    photoCount: 0,
  });
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.status, 'draft');
    assert.equal(parsed.missing, true);
  }
});
