import assert from 'node:assert/strict';
import { test } from 'node:test';

import { FSA_PATTERN, parseProfileInput, PROFILE_UTILITIES } from './profile-input.ts';

test('the FSA regex matches a New Brunswick forward sortation area', () => {
  assert.equal(FSA_PATTERN.test('E1C'), true);
  assert.equal(FSA_PATTERN.test('e1c'), true);
  assert.equal(FSA_PATTERN.test('E1C1A1'), false);
  assert.equal(FSA_PATTERN.test('E12'), false);
});

test('parseProfileInput accepts an optional first name and a known utility', () => {
  const parsed = parseProfileInput({
    fullName: ' Ada ',
    postalCodeFsa: 'e1c',
    electricUtility: 'nb_power',
  });
  assert.deepEqual(parsed, {
    ok: true,
    value: { fullName: 'Ada', postalCodeFsa: 'E1C', electricUtility: 'nb_power' },
  });
});

test('parseProfileInput allows a missing first name', () => {
  const parsed = parseProfileInput({
    fullName: '   ',
    postalCodeFsa: 'E3B',
    electricUtility: 'unknown',
  });
  assert.deepEqual(parsed, {
    ok: true,
    value: { fullName: null, postalCodeFsa: 'E3B', electricUtility: 'unknown' },
  });
});

test('parseProfileInput rejects a bad FSA or an unknown utility', () => {
  assert.equal(parseProfileInput({ postalCodeFsa: 'E1', electricUtility: 'nb_power' }).ok, false);
  assert.equal(
    parseProfileInput({ postalCodeFsa: 'E1C', electricUtility: 'hydro_quebec' }).ok,
    false,
  );
});

test('S05 utilities stay inside the SQL enum', () => {
  const sql = [
    'nb_power',
    'saint_john_energy',
    'energie_edmundston',
    'perth_andover',
    'other',
    'unknown',
  ];
  for (const value of PROFILE_UTILITIES) {
    assert.equal(sql.includes(value), true);
  }
});
