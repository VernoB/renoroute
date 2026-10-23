import assert from 'node:assert/strict';
import { test } from 'node:test';

import { homeInputToUpdate, homeRowToInput, mergeHomeUpdate } from './home-row.ts';
import type { Database } from '../types/database.types.ts';

const row: Database['public']['Tables']['homes']['Row'] = {
  annual_electricity_kwh: 24000,
  annual_energy_cost_cad: 2400,
  annual_oil_litres: null,
  created_at: '2026-10-22T00:00:00.000Z',
  electric_utility: 'nb_power',
  energy_advisor_status: 'none',
  floor_area_sqft: 1400,
  has_basement: true,
  heating_primary: 'electric_baseboard',
  heating_secondary: null,
  home_type: 'detached',
  household_income_band: 'prefer_not_to_say',
  id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  label: 'Maison',
  municipality: null,
  notes: null,
  occupants: 3,
  owner_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  owner_occupied: true,
  postal_code_fsa: 'E1C',
  pre_evaluation_date: null,
  province: 'NB',
  storeys: 1,
  updated_at: '2026-10-22T00:00:00.000Z',
  water_heater: null,
  year_built: 1978,
};

test('a home row round-trips through the intake fields', () => {
  const input = homeRowToInput(row);
  assert.equal(input.yearBuilt, 1978);
  assert.equal(input.homeType, 'detached');
  assert.equal(input.heatingPrimary, 'electric_baseboard');
  const update = homeInputToUpdate(input);
  assert.equal(update.year_built, 1978);
  assert.equal(update.electric_utility, 'nb_power');
  assert.equal(update.postal_code_fsa, 'E1C');
});

test('intake draft does not wipe the profile utility or FSA', () => {
  const draft = homeRowToInput(row);
  draft.electricUtility = 'unknown';
  draft.postalCodeFsa = null;
  draft.label = null;
  const update = mergeHomeUpdate(row, draft);
  assert.equal(update.electric_utility, 'nb_power');
  assert.equal(update.postal_code_fsa, 'E1C');
  assert.equal(update.label, 'Maison');
});
