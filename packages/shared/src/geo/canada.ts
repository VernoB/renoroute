/** Canadian province and territory codes. Postal geography only; not a rebate claim. */

export const CANADIAN_PROVINCES = [
  'NB',
  'NS',
  'PE',
  'NL',
  'QC',
  'ON',
  'MB',
  'SK',
  'AB',
  'BC',
  'YT',
  'NT',
  'NU',
] as const;

export type CanadianProvince = (typeof CANADIAN_PROVINCES)[number];

/** Provinces whose rebate and energy rows have been reviewed. NS rows stay draft. */
export const FULLY_SUPPORTED_PROVINCES = [
  'NB',
  'NS',
] as const satisfies readonly CanadianProvince[];

export type CoverageLevel = 'full' | 'federal_only';

const FSA_FIRST_LETTER: Record<string, CanadianProvince | 'ambiguous'> = {
  A: 'NL',
  B: 'NS',
  C: 'PE',
  E: 'NB',
  G: 'QC',
  H: 'QC',
  J: 'QC',
  K: 'ON',
  L: 'ON',
  M: 'ON',
  N: 'ON',
  P: 'ON',
  R: 'MB',
  S: 'SK',
  T: 'AB',
  V: 'BC',
  X: 'ambiguous',
  Y: 'YT',
};

export function isCanadianProvince(value: string): value is CanadianProvince {
  return (CANADIAN_PROVINCES as readonly string[]).includes(value);
}

/**
 * Suggest a province from the first letter of a postal code.
 * Never uses GPS. X is Nunavut or the Northwest Territories, so the caller must ask.
 */
export function suggestProvinceFromPostal(postal: string): CanadianProvince | null {
  const letter = postal.trim().charAt(0).toUpperCase();
  const match = FSA_FIRST_LETTER[letter];
  if (!match || match === 'ambiguous') {
    return null;
  }
  return match;
}

export function coverageLevel(province: string | null | undefined): CoverageLevel {
  if (province && (FULLY_SUPPORTED_PROVINCES as readonly string[]).includes(province)) {
    return 'full';
  }
  return 'federal_only';
}

/** i18n key for the affiliation line. NB copy stays the existing NB Power sentence. */
export function affiliationCopyKey(
  province: string | null | undefined,
): 'legal.notAffiliatedNb' | 'legal.notAffiliatedNs' | 'legal.notAffiliatedNational' {
  if (province === 'NB') {
    return 'legal.notAffiliatedNb';
  }
  if (province === 'NS') {
    return 'legal.notAffiliatedNs';
  }
  return 'legal.notAffiliatedNational';
}
