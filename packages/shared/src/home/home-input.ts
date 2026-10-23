import { z } from 'zod';

import { FSA_PATTERN } from '../profile/profile-input.ts';
import {
  ELECTRIC_UTILITIES,
  HEATING_SYSTEMS,
  HOME_TYPES,
  INCOME_BANDS,
} from './enums.ts';

export const HOME_PROVINCES = ['NB', 'NS', 'PE', 'NL', 'QC'] as const;

function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => (value && value.length > 0 ? value : null));
}

function optionalInt(min: number, max: number) {
  return z.number().int().min(min).max(max).nullish().default(null);
}

function optionalEnum<const T extends readonly [string, ...string[]]>(values: T) {
  return z.enum(values).nullish().default(null);
}

function optionalBool() {
  return z.boolean().nullish().default(null);
}

export const homeInputSchema = z.object({
  label: optionalText(80),
  province: z.enum(HOME_PROVINCES).default('NB'),
  postalCodeFsa: z
    .string()
    .trim()
    .toUpperCase()
    .regex(FSA_PATTERN)
    .nullish()
    .transform((value) => value ?? null),
  municipality: optionalText(80),
  yearBuilt: optionalInt(1700, 2100),
  homeType: optionalEnum(HOME_TYPES),
  storeys: z.number().min(0.5).max(5).nullish().default(null),
  floorAreaSqft: optionalInt(100, 20000),
  hasBasement: optionalBool(),
  heatingPrimary: z.enum(HEATING_SYSTEMS).default('unknown'),
  heatingSecondary: optionalEnum(HEATING_SYSTEMS),
  waterHeater: optionalText(60),
  electricUtility: z.enum(ELECTRIC_UTILITIES),
  annualElectricityKwh: optionalInt(0, 200000),
  annualEnergyCostCad: z.number().min(0).max(100000).nullish().default(null),
  annualOilLitres: optionalInt(0, 20000),
  occupants: optionalInt(1, 20),
  householdIncomeBand: optionalEnum(INCOME_BANDS),
  ownerOccupied: optionalBool(),
  notes: optionalText(2000),
});

export type HomeInput = z.infer<typeof homeInputSchema>;

export function parseHomeInput(
  input: Record<string, unknown>,
): { ok: true; value: HomeInput } | { ok: false; field: string } {
  const parsed = homeInputSchema.safeParse(input);
  if (parsed.success) {
    return { ok: true, value: parsed.data };
  }
  const issue = parsed.error.issues[0];
  const path = issue?.path[0];
  return { ok: false, field: typeof path === 'string' ? path : 'root' };
}
