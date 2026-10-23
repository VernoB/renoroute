import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseHomeInput } from './home-input.ts';

test('parseHomeInput accepts a valid partial home', () => {
  const parsed = parseHomeInput({
    yearBuilt: 1978,
    homeType: 'detached',
    electricUtility: 'unknown',
  });
  assert.deepEqual(parsed, {
    ok: true,
    value: {
      label: null,
      province: 'NB',
      postalCodeFsa: null,
      municipality: null,
      yearBuilt: 1978,
      homeType: 'detached',
      storeys: null,
      floorAreaSqft: null,
      hasBasement: null,
      heatingPrimary: 'unknown',
      heatingSecondary: null,
      waterHeater: null,
      electricUtility: 'unknown',
      annualElectricityKwh: null,
      annualEnergyCostCad: null,
      annualOilLitres: null,
      occupants: null,
      householdIncomeBand: null,
      ownerOccupied: null,
      notes: null,
    },
  });
});

test('parseHomeInput rejects a year before 1700', () => {
  const parsed = parseHomeInput({ electricUtility: 'nb_power', yearBuilt: 1600 });
  assert.equal(parsed.ok, false);
  if (!parsed.ok) {
    assert.equal(parsed.field, 'yearBuilt');
  }
});

test('parseHomeInput rejects a bad FSA', () => {
  const parsed = parseHomeInput({ electricUtility: 'nb_power', postalCodeFsa: 'E1' });
  assert.equal(parsed.ok, false);
  if (!parsed.ok) {
    assert.equal(parsed.field, 'postalCodeFsa');
  }
});

test('parseHomeInput rejects an invented homeType', () => {
  const parsed = parseHomeInput({ electricUtility: 'nb_power', homeType: 'castle' });
  assert.equal(parsed.ok, false);
  if (!parsed.ok) {
    assert.equal(parsed.field, 'homeType');
  }
});
