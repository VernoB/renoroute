import { z } from 'zod';

/** Mirrors `public.electric_utility` except `other`, which S05 does not offer. */
export const PROFILE_UTILITIES = [
  'nb_power',
  'saint_john_energy',
  'energie_edmundston',
  'perth_andover',
  'unknown',
] as const;

export type ProfileUtility = (typeof PROFILE_UTILITIES)[number];

/** First three characters of a Canadian postal code. Matches `profiles.postal_code_fsa`. */
export const FSA_PATTERN = /^[A-Za-z][0-9][A-Za-z]$/;

export const profileInputSchema = z.object({
  fullName: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  postalCodeFsa: z.string().trim().toUpperCase().regex(FSA_PATTERN),
  electricUtility: z.enum(PROFILE_UTILITIES),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;

export function parseProfileInput(input: {
  fullName?: string;
  postalCodeFsa: string;
  electricUtility: string;
}): { ok: true; value: ProfileInput } | { ok: false; field: 'postalCodeFsa' | 'electricUtility' } {
  const parsed = profileInputSchema.safeParse(input);
  if (parsed.success) {
    return { ok: true, value: parsed.data };
  }
  const issue = parsed.error.issues[0];
  const field = issue?.path[0] === 'electricUtility' ? 'electricUtility' : 'postalCodeFsa';
  return { ok: false, field };
}
