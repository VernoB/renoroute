import { z } from 'zod';

import { COST_UNITS } from '../calc/cost-savings.ts';
import { HOME_PROVINCES } from '../home/home-input.ts';
import {
  AMOUNT_TYPES,
  ELECTRIC_UTILITIES,
  MEASURE_CODES,
  PROGRAM_STATUSES,
} from '../home/enums.ts';
import { rebateConditionsSchema } from './conditions.ts';

export const PROGRAM_JURISDICTIONS = ['NB', 'CA', 'NB-SJ', 'NS', 'PE', 'NL', 'QC'] as const;
export const BENCHMARK_PROVINCES = [...HOME_PROVINCES, 'CA'] as const;

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => (value && value.length > 0 ? value : null));
}

function requiredText(max: number) {
  return z.string().trim().min(1).max(max);
}

const httpsUrl = z
  .string()
  .trim()
  .url()
  .refine((value) => value.startsWith('https://'), { message: 'https' });

const optionalHttpsUrl = httpsUrl.nullish().transform((value) => value ?? null);

const isoDate = z.string().regex(ISO_DATE_PATTERN);

const optionalIsoDate = isoDate.nullish().transform((value) => value ?? null);

const optionalCad = z
  .number()
  .min(0)
  .max(1_000_000)
  .nullish()
  .transform((value) => value ?? null);

const optionalInt = z
  .number()
  .int()
  .min(0)
  .max(1_000_000)
  .nullish()
  .transform((value) => value ?? null);

export const rebateProgramInputSchema = z
  .object({
    slug: z.string().trim().regex(SLUG_PATTERN).max(80),
    jurisdiction: z.enum(PROGRAM_JURISDICTIONS).default('NB'),
    administrator: requiredText(80),
    nameFr: requiredText(160),
    nameEn: requiredText(160),
    summaryFr: optionalText(2000),
    summaryEn: optionalText(2000),
    status: z.enum(PROGRAM_STATUSES),
    requiresPreEvaluation: z.boolean().default(false),
    preEvaluationFeeCad: optionalCad,
    preEvaluationFeeNote: optionalText(80),
    completionWindowMonths: z
      .number()
      .int()
      .min(1)
      .max(60)
      .nullish()
      .transform((value) => value ?? null),
    incomeMaxCad: optionalInt,
    waitlistNoteFr: optionalText(500),
    waitlistNoteEn: optionalText(500),
    appliesToUtilities: z
      .array(z.enum(ELECTRIC_UTILITIES))
      .min(1)
      .nullish()
      .transform((value) => value ?? null),
    officialUrl: optionalHttpsUrl,
    sourceUrl: httpsUrl,
    lastVerifiedAt: isoDate,
    verifiedBy: z
      .string()
      .uuid()
      .nullish()
      .transform((value) => value ?? null),
    opensOn: optionalIsoDate,
    closesOn: optionalIsoDate,
    isPublished: z.boolean().default(false),
    internalNotes: optionalText(2000),
  })
  .strict()
  .refine((value) => !value.opensOn || !value.closesOn || value.opensOn <= value.closesOn, {
    path: ['closesOn'],
  });

export const rebateRuleInputSchema = z
  .object({
    programId: z.string().uuid(),
    measure: z.enum(MEASURE_CODES),
    amountType: z.enum(AMOUNT_TYPES),
    amountMinCad: optionalCad,
    amountMaxCad: optionalCad,
    unitLabelFr: optionalText(80),
    unitLabelEn: optionalText(80),
    maxUnits: z
      .number()
      .int()
      .min(1)
      .max(10_000)
      .nullish()
      .transform((value) => value ?? null),
    conditions: rebateConditionsSchema.default({}),
    eligibilityNotesFr: optionalText(2000),
    eligibilityNotesEn: optionalText(2000),
    sourceUrl: httpsUrl,
    lastVerifiedAt: isoDate,
    isActive: z.boolean().default(false),
  })
  .strict()
  .refine(
    (value) =>
      value.amountMinCad === null ||
      value.amountMaxCad === null ||
      value.amountMinCad <= value.amountMaxCad,
    { path: ['amountMaxCad'] },
  );

export const benchmarkInputSchema = z
  .object({
    province: z.enum(BENCHMARK_PROVINCES).default('NB'),
    measure: z.enum(MEASURE_CODES),
    costLowCad: z.number().min(0).max(1_000_000),
    costHighCad: z.number().min(0).max(1_000_000),
    costUnit: z.enum(COST_UNITS).default('project'),
    savingsPctLow: z
      .number()
      .min(0)
      .max(100)
      .nullish()
      .transform((value) => value ?? null),
    savingsPctHigh: z
      .number()
      .min(0)
      .max(100)
      .nullish()
      .transform((value) => value ?? null),
    assumptions: z.record(z.string(), z.unknown()).default({}),
    sourceUrl: httpsUrl,
    lastVerifiedAt: isoDate,
    isActive: z.boolean().default(false),
  })
  .strict()
  .refine((value) => value.costLowCad <= value.costHighCad, { path: ['costHighCad'] })
  .refine(
    (value) =>
      value.savingsPctLow === null ||
      value.savingsPctHigh === null ||
      value.savingsPctLow <= value.savingsPctHigh,
    { path: ['savingsPctHigh'] },
  );

export type RebateProgramInput = z.infer<typeof rebateProgramInputSchema>;
export type RebateRuleInput = z.infer<typeof rebateRuleInputSchema>;
export type BenchmarkInput = z.infer<typeof benchmarkInputSchema>;

export function parseRebateProgramInput(
  input: unknown,
): { ok: true; value: RebateProgramInput } | { ok: false; field: string } {
  return parseAdminInput<RebateProgramInput>(rebateProgramInputSchema, input);
}

export function parseRebateRuleInput(
  input: unknown,
): { ok: true; value: RebateRuleInput } | { ok: false; field: string } {
  return parseAdminInput<RebateRuleInput>(rebateRuleInputSchema, input);
}

export function parseBenchmarkInput(
  input: unknown,
): { ok: true; value: BenchmarkInput } | { ok: false; field: string } {
  return parseAdminInput<BenchmarkInput>(benchmarkInputSchema, input);
}

function parseAdminInput<T>(
  schema: { safeParse: (input: unknown) => z.SafeParseReturnType<unknown, T> },
  input: unknown,
): { ok: true; value: T } | { ok: false; field: string } {
  const parsed = schema.safeParse(input);
  if (parsed.success) {
    return { ok: true, value: parsed.data };
  }
  const path = parsed.error.issues[0]?.path[0];
  return { ok: false, field: typeof path === 'string' ? path : 'root' };
}
