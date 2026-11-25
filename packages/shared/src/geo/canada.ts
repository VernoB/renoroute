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

export type CoverageLevel = 'full' | 'federal_only';

/**
 * Utility rows the product may describe. `published` is the same fact as
 * `energy_prices.is_published` for that utility. Nova Scotia Power is published in 0011.
 */
export const UTILITY_COVERAGE = [
  { code: 'nb_power', province: 'NB', published: true },
  { code: 'saint_john_energy', province: 'NB', published: true },
  { code: 'energie_edmundston', province: 'NB', published: true },
  { code: 'perth_andover', province: 'NB', published: true },
  { code: 'nova_scotia_power', province: 'NS', published: true },
] as const;

/** Rebate programs that are published. NS open programs are published in 0011. */
const PUBLISHED_REBATE_PROVINCES = ['NB', 'NS'] as const satisfies readonly CanadianProvince[];

export type ProvinceCoverage = {
  level: CoverageLevel;
  utilitiesVerified: boolean;
  rebatesPublished: boolean;
};

/** Badge and utility note both read this. Full coverage requires a published utility. */
export function provinceCoverage(province: string | null | undefined): ProvinceCoverage {
  const utilitiesVerified = UTILITY_COVERAGE.some(
    (row) => row.province === province && row.published,
  );
  const rebatesPublished = (PUBLISHED_REBATE_PROVINCES as readonly string[]).includes(
    province ?? '',
  );
  return {
    utilitiesVerified,
    rebatesPublished,
    level: utilitiesVerified && rebatesPublished ? 'full' : 'federal_only',
  };
}

/** Provinces where `provinceCoverage` is full. */
export const FULLY_SUPPORTED_PROVINCES = CANADIAN_PROVINCES.filter(
  (code) => provinceCoverage(code).level === 'full',
);

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
  return provinceCoverage(province).level;
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
