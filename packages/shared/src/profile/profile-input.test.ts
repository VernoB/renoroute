import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  FSA_PATTERN,
  normalizePostalPrefix,
  parseProfileInput,
  PROFILE_UTILITIES,
  profileUtilitiesForProvince,
} from './profile-input.ts';

test('a postal prefix is letter-digit-letter and drops a doubled first letter', () => {
  assert.equal(normalizePostalPrefix('b3h'), 'B3H');
  assert.equal(normalizePostalPrefix('BB3'), 'B3');
  assert.equal(normalizePostalPrefix('BB3H'), 'B3H');
  assert.equal(normalizePostalPrefix('E12'), 'E1');
});

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
    value: { fullName: 'Ada', postalCodeFsa: 'E1C', electricUtility: 'nb_power', province: null },
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
    value: { fullName: null, postalCodeFsa: 'E3B', electricUtility: 'unknown', province: null },
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
    'nova_scotia_power',
  ];
  for (const value of PROFILE_UTILITIES) {
    assert.equal(sql.includes(value), true);
  }
  assert.deepEqual(profileUtilitiesForProvince('NS'), ['nova_scotia_power', 'unknown']);
  assert.deepEqual(profileUtilitiesForProvince('ON'), ['unknown']);
});
