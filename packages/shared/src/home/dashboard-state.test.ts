import assert from 'node:assert/strict';
import { test } from 'node:test';

import { dashboardState, intakePercent, isIntakeComplete, nextActionKey } from './dashboard-state.ts';

const completeHome = {
  homeType: 'detached' as const,
  yearBuilt: 1978,
  heatingPrimary: 'electric_baseboard' as const,
  electricUtility: 'nb_power' as const,
};

test('no home is the empty dashboard', () => {
  assert.equal(dashboardState({ hasHome: false, home: null, planProgress: 'none' }), 'no_home');
});

test('a home without year or type is intake_partial', () => {
  assert.equal(isIntakeComplete({ heatingPrimary: 'unknown', electricUtility: 'nb_power' }), false);
  assert.equal(
    dashboardState({ hasHome: true, home: { electricUtility: 'nb_power' }, planProgress: 'none' }),
    'intake_partial',
  );
});

test('preview and unlocked plans have their own states', () => {
  assert.equal(
    dashboardState({ hasHome: true, home: completeHome, planProgress: 'preview' }),
    'plan_preview',
  );
  assert.equal(
    dashboardState({ hasHome: true, home: completeHome, planProgress: 'unlocked' }),
    'plan_complete',
  );
});

test('complete intake points to photos, then review', () => {
  assert.equal(nextActionKey('intake_partial'), 'dashboard.next.intake_partial');
  assert.equal(
    nextActionKey('intake_partial', { intakeComplete: true, photoCount: 0 }),
    'dashboard.next.photos',
  );
  assert.equal(
    nextActionKey('intake_partial', { intakeComplete: true, photoCount: 2 }),
    'dashboard.next.review',
  );
});

test('intake percent is 0 without a home and 100 when the eight fields are filled', () => {
  assert.equal(intakePercent(null), 0);
  assert.equal(
    intakePercent({
      ...completeHome,
      floorAreaSqft: 1400,
      waterHeater: 'electric',
      annualElectricityKwh: 24000,
      occupants: 3,
      householdIncomeBand: 'prefer_not_to_say',
    }),
    100,
  );
});
