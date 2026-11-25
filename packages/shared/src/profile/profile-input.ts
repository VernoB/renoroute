import { z } from 'zod';

import { CANADIAN_PROVINCES } from '../geo/canada.ts';

/** Mirrors `public.electric_utility` except `other`, which S05 does not offer. */
export const PROFILE_UTILITIES = [
  'nb_power',
  'saint_john_energy',
  'energie_edmundston',
  'perth_andover',
  'nova_scotia_power',
  'unknown',
] as const;

export type ProfileUtility = (typeof PROFILE_UTILITIES)[number];

const NB_PROFILE_UTILITIES = [
  'nb_power',
  'saint_john_energy',
  'energie_edmundston',
  'perth_andover',
  'unknown',
] as const satisfies readonly ProfileUtility[];

/** Utilities the profile screen can offer. NS Power stays selectable while its rate is a draft. */
export function profileUtilitiesForProvince(province: string | null): readonly ProfileUtility[] {
  if (province === 'NS') {
    return ['nova_scotia_power', 'unknown'];
  }
  if (province === null || province === 'NB') {
    return NB_PROFILE_UTILITIES;
  }
  return ['unknown'];
}

/** First three characters of a Canadian postal code. Matches `profiles.postal_code_fsa`. */
export const FSA_PATTERN = /^[A-Za-z][0-9][A-Za-z]$/;

const FSA_SLOT = [/[A-Z]/, /[0-9]/, /[A-Z]/] as const;

/**
 * Keep a letter-digit-letter prefix. Drops the doubled letter Android produces
 * when `autoCapitalize="characters"` fights a controlled input (`BB3` from `B3H`).
 */
export function normalizePostalPrefix(raw: string): string {
  let next = '';
  for (const char of raw.toUpperCase()) {
    if (next.length >= FSA_SLOT.length) {
      break;
    }
    const slot = FSA_SLOT[next.length];
    if (slot?.test(char)) {
      next += char;
    }
  }
  return next;
}

export const profileInputSchema = z.object({
  fullName: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  postalCodeFsa: z.string().trim().toUpperCase().regex(FSA_PATTERN),
  electricUtility: z.enum(PROFILE_UTILITIES),
  province: z
    .enum(CANADIAN_PROVINCES)
    .nullish()
    .transform((value) => value ?? null),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;

export function parseProfileInput(input: {
  fullName?: string;
  postalCodeFsa: string;
  electricUtility: string;
  province?: string | null;
}):
  | { ok: true; value: ProfileInput }
  | { ok: false; field: 'postalCodeFsa' | 'electricUtility' | 'province' } {
  const parsed = profileInputSchema.safeParse(input);
  if (parsed.success) {
    return { ok: true, value: parsed.data };
  }
  const issue = parsed.error.issues[0];
  const path = issue?.path[0];
  const field =
    path === 'electricUtility' || path === 'province' || path === 'postalCodeFsa'
      ? path
      : 'postalCodeFsa';
  return { ok: false, field };
}
