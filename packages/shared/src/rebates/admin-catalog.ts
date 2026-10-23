import { z } from 'zod';

import { ENERGY_FUELS } from '../calc/energy-prices.ts';

/** UI spec A01 uses 30 days. TODO(verify): Brown still needs to confirm this window. */
export const ADMIN_STALE_AFTER_DAYS = 30;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function todayIsoDate(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function isVerificationStale(
  lastVerifiedAt: string | null,
  now: Date = new Date(),
  staleAfterDays: number = ADMIN_STALE_AFTER_DAYS,
): boolean {
  if (!lastVerifiedAt || !ISO_DATE_PATTERN.test(lastVerifiedAt)) {
    return true;
  }
  const verified = Date.parse(`${lastVerifiedAt}T00:00:00.000Z`);
  if (!Number.isFinite(verified)) {
    return true;
  }
  const ageMs = now.getTime() - verified;
  return ageMs > staleAfterDays * 24 * 60 * 60 * 1000;
}

export function canPublishEnergyPrice(sourceUrl: string | null | undefined): boolean {
  return typeof sourceUrl === 'string' && sourceUrl.startsWith('https://');
}

const httpsUrl = z
  .string()
  .trim()
  .url()
  .refine((value) => value.startsWith('https://'), { message: 'https' });

export const energyPriceInputSchema = z
  .object({
    fuel: z.enum(ENERGY_FUELS),
    unit: z
      .string()
      .trim()
      .max(40)
      .nullish()
      .transform((value) => (value && value.length > 0 ? value : null)),
    priceCad: z
      .number()
      .min(0)
      .max(100)
      .nullish()
      .transform((value) => value ?? null),
    effectiveFrom: z
      .string()
      .regex(ISO_DATE_PATTERN)
      .nullish()
      .transform((value) => value ?? null),
    sourceUrl: httpsUrl.nullish().transform((value) => value ?? null),
    verifiedAt: z
      .string()
      .regex(ISO_DATE_PATTERN)
      .nullish()
      .transform((value) => value ?? null),
    isPublished: z.boolean().default(false),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.isPublished && !canPublishEnergyPrice(value.sourceUrl)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['isPublished'] });
    }
  });

export type EnergyPriceInput = z.infer<typeof energyPriceInputSchema>;

export function parseEnergyPriceInput(
  input: unknown,
): { ok: true; value: EnergyPriceInput } | { ok: false; field: string } {
  const parsed = energyPriceInputSchema.safeParse(input);
  if (parsed.success) {
    return { ok: true, value: parsed.data };
  }
  const path = parsed.error.issues[0]?.path[0];
  return { ok: false, field: typeof path === 'string' ? path : 'root' };
}
