import { z } from 'zod';

import { ELECTRIC_UTILITIES, HEATING_SYSTEMS } from '../home/enums.ts';

export const rebateConditionsSchema = z
  .object({
    requires_program_pre_evaluation: z.boolean().optional(),
    max_household_income_cad: z.number().int().nonnegative().optional(),
    eligible_heating_before: z.array(z.enum(HEATING_SYSTEMS)).min(1).optional(),
    utilities: z.array(z.enum(ELECTRIC_UTILITIES)).min(1).optional(),
    owner_occupied_only: z.boolean().optional(),
  })
  .strict();

export type RebateConditions = z.infer<typeof rebateConditionsSchema>;

export function parseRebateConditions(
  value: unknown,
): { ok: true; value: RebateConditions } | { ok: false } {
  const parsed = rebateConditionsSchema.safeParse(value ?? {});
  return parsed.success ? { ok: true, value: parsed.data } : { ok: false };
}
