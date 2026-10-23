import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  evaluateEligibility,
  type EligibilityHome,
  type EligibilityProgram,
} from './eligibility.ts';
import { parseRebateConditions } from '../rebates/conditions.ts';

const home: EligibilityHome = {
  electricUtility: 'nb_power',
  householdIncomeBand: 'from_100k_to_150k',
  heatingPrimary: 'electric_baseboard',
  ownerOccupied: true,
  energyAdvisorStatus: 'none',
};

const totalHome: EligibilityProgram = {
  slug: 'nbp-total-home-energy-savings',
  status: 'open',
  requiresPreEvaluation: true,
  incomeMaxCad: null,
  appliesToUtilities: null,
};

const enhanced: EligibilityProgram = {
  slug: 'nbp-enhanced-energy-savings',
  status: 'waitlist',
  requiresPreEvaluation: true,
  incomeMaxCad: 70_000,
  appliesToUtilities: null,
};

const greenerLoan: EligibilityProgram = {
  slug: 'ca-greener-homes-loan',
  status: 'closed',
  requiresPreEvaluation: false,
  incomeMaxCad: null,
  appliesToUtilities: null,
};

const federalHeatPump: EligibilityProgram = {
  slug: 'ca-national-heat-pump-rebate',
  status: 'announced',
  requiresPreEvaluation: false,
  incomeMaxCad: null,
  appliesToUtilities: null,
};

const saintJohn: EligibilityProgram = {
  slug: 'sje-heat-pump-rental-financing',
  status: 'open',
  requiresPreEvaluation: false,
  incomeMaxCad: null,
  appliesToUtilities: ['saint_john_energy'],
};

const openRule = {
  measure: 'air_sealing',
  conditions: { requires_program_pre_evaluation: true },
  isActive: true,
};

test('parseRebateConditions accepts the documented condition keys', () => {
  const parsed = parseRebateConditions({
    requires_program_pre_evaluation: true,
    max_household_income_cad: 70000,
    eligible_heating_before: ['electric_baseboard', 'oil_furnace'],
    utilities: ['nb_power'],
  });
  assert.equal(parsed.ok, true);
});

test('parseRebateConditions rejects an invented key', () => {
  assert.equal(parseRebateConditions({ guaranteed: true }).ok, false);
});

test('open Total Home program is possible until the pre-evaluation is done', () => {
  const result = evaluateEligibility(home, totalHome, openRule);
  assert.equal(result.status, 'possible');
  assert.deepEqual(result.reasons, ['pre_evaluation_required']);
});

test('open Total Home program is likely after a completed pre-evaluation', () => {
  const result = evaluateEligibility(
    { ...home, energyAdvisorStatus: 'pre_evaluation_done' },
    totalHome,
    openRule,
  );
  assert.equal(result.status, 'likely');
  assert.deepEqual(result.reasons, []);
});

test('waitlist Enhanced program stays possible for an under-70k household', () => {
  const result = evaluateEligibility(
    { ...home, householdIncomeBand: 'under_70k', energyAdvisorStatus: 'pre_evaluation_done' },
    enhanced,
    { measure: 'windows', conditions: {}, isActive: true },
  );
  assert.equal(result.status, 'possible');
  assert.ok(result.reasons.includes('program_waitlist'));
});

test('Enhanced program is not eligible above the 70k income ceiling', () => {
  const result = evaluateEligibility(home, enhanced, {
    measure: 'windows',
    conditions: { max_household_income_cad: 70000 },
    isActive: true,
  });
  assert.equal(result.status, 'not_eligible');
  assert.ok(result.reasons.includes('income_over_max'));
});

test('closed Greener Homes Loan is never eligible', () => {
  const result = evaluateEligibility(home, greenerLoan, {
    measure: 'windows',
    conditions: {},
    isActive: true,
  });
  assert.equal(result.status, 'not_eligible');
  assert.deepEqual(result.reasons, ['program_closed']);
});

test('announced federal heat-pump rebate is possible and flagged as upcoming', () => {
  const result = evaluateEligibility(home, federalHeatPump, {
    measure: 'mini_split_heat_pump',
    conditions: {},
    isActive: true,
  });
  assert.equal(result.status, 'possible');
  assert.deepEqual(result.reasons, ['program_announced']);
});

test('Saint John Energy financing is limited to that utility', () => {
  const otherUtility = evaluateEligibility(home, saintJohn, {
    measure: 'mini_split_heat_pump',
    conditions: {},
    isActive: true,
  });
  assert.equal(otherUtility.status, 'not_eligible');
  assert.deepEqual(otherUtility.reasons, ['utility_mismatch']);

  const customer = evaluateEligibility(
    { ...home, electricUtility: 'saint_john_energy' },
    saintJohn,
    { measure: 'mini_split_heat_pump', conditions: {}, isActive: true },
  );
  assert.equal(customer.status, 'likely');
});

test('unknown utility or income stays unknown instead of inventing eligibility', () => {
  const utility = evaluateEligibility({ ...home, electricUtility: 'unknown' }, saintJohn, {
    measure: 'mini_split_heat_pump',
    conditions: {},
    isActive: true,
  });
  assert.equal(utility.status, 'unknown');
  assert.ok(utility.reasons.includes('utility_unknown'));

  const income = evaluateEligibility(
    {
      ...home,
      householdIncomeBand: 'prefer_not_to_say',
      energyAdvisorStatus: 'pre_evaluation_done',
    },
    enhanced,
    { measure: 'windows', conditions: {}, isActive: true },
  );
  assert.equal(income.status, 'unknown');
  assert.ok(income.reasons.includes('income_unknown'));
});

test('heating and owner-occupied conditions can exclude a home', () => {
  const heating = evaluateEligibility(home, totalHome, {
    measure: 'mini_split_heat_pump',
    conditions: { eligible_heating_before: ['oil_furnace'] },
    isActive: true,
  });
  assert.equal(heating.status, 'not_eligible');
  assert.ok(heating.reasons.includes('heating_not_eligible'));

  const tenant = evaluateEligibility(
    { ...home, ownerOccupied: false, energyAdvisorStatus: 'pre_evaluation_done' },
    totalHome,
    { measure: 'air_sealing', conditions: { owner_occupied_only: true }, isActive: true },
  );
  assert.equal(tenant.status, 'not_eligible');
  assert.ok(tenant.reasons.includes('owner_occupied_required'));
});
