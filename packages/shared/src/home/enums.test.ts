import assert from 'node:assert/strict';
import { test } from 'node:test';

import { Constants, type Database } from '../types/database.types.ts';
import {
  AMOUNT_TYPES,
  APP_LOCALES,
  ASSESSMENT_STATUSES,
  CONTRACTOR_STATUSES,
  ELECTRIC_UTILITIES,
  ENERGY_ADVISOR_STATUSES,
  ENERGY_FUELS,
  HEATING_SYSTEMS,
  HOME_TYPES,
  INCOME_BANDS,
  ITEM_STATUSES,
  LEAD_STATUSES,
  MEASURE_CODES,
  PAYMENT_STATUSES,
  PHOTO_CATEGORIES,
  PLAN_STATUSES,
  PROGRAM_STATUSES,
  REBATE_CHECKLIST_KINDS,
  USER_ROLES,
} from './enums.ts';

const SHARED_ENUMS = {
  amount_type: AMOUNT_TYPES,
  app_locale: APP_LOCALES,
  assessment_status: ASSESSMENT_STATUSES,
  contractor_status: CONTRACTOR_STATUSES,
  electric_utility: ELECTRIC_UTILITIES,
  energy_advisor_status: ENERGY_ADVISOR_STATUSES,
  energy_fuel: ENERGY_FUELS,
  heating_system: HEATING_SYSTEMS,
  home_type: HOME_TYPES,
  income_band: INCOME_BANDS,
  item_status: ITEM_STATUSES,
  lead_status: LEAD_STATUSES,
  measure_code: MEASURE_CODES,
  payment_status: PAYMENT_STATUSES,
  photo_category: PHOTO_CATEGORIES,
  plan_status: PLAN_STATUSES,
  program_status: PROGRAM_STATUSES,
  rebate_checklist_kind: REBATE_CHECKLIST_KINDS,
  user_role: USER_ROLES,
} as const;

type PublicEnums = Database['public']['Enums'];
type SameMembers<A extends readonly string[], B extends string> = A[number] extends B
  ? B extends A[number]
    ? true
    : false
  : false;
type MirrorCheck = {
  [K in keyof PublicEnums]: SameMembers<(typeof SHARED_ENUMS)[K], PublicEnums[K]>;
};
type KeysMatch = keyof typeof SHARED_ENUMS extends keyof PublicEnums
  ? keyof PublicEnums extends keyof typeof SHARED_ENUMS
    ? true
    : never
  : never;

const _keysMatch: KeysMatch = true;
const _membersMatch: MirrorCheck = {
  amount_type: true,
  app_locale: true,
  assessment_status: true,
  contractor_status: true,
  electric_utility: true,
  energy_advisor_status: true,
  energy_fuel: true,
  heating_system: true,
  home_type: true,
  income_band: true,
  item_status: true,
  lead_status: true,
  measure_code: true,
  payment_status: true,
  photo_category: true,
  plan_status: true,
  program_status: true,
  rebate_checklist_kind: true,
  user_role: true,
};

void _keysMatch;
void _membersMatch;

test('every generated public enum has a matching shared const', () => {
  const generated = Constants.public.Enums;
  assert.deepEqual(Object.keys(SHARED_ENUMS).sort(), Object.keys(generated).sort());
});

for (const name of Object.keys(Constants.public.Enums) as (keyof typeof SHARED_ENUMS)[]) {
  test(`${name} const array equals Constants.public.Enums.${name}`, () => {
    assert.deepEqual(SHARED_ENUMS[name], Constants.public.Enums[name]);
  });
}
