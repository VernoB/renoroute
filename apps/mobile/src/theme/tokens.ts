/**
 * Design tokens. Source of truth for the app, mirrored in apps/landing/tokens.css.
 * Spec: docs/04-ui-ux.md §5 (v1 colours unchanged + v2 extension).
 * Contrast ratios in the spec are indicative and still need a checker pass.
 */

export const colors = {
  primary: {
    50: '#E8F3EE',
    500: '#2F9E73',
    700: '#1F6F50',
    900: '#0E3B2B',
  },
  forest: {
    950: '#0A1F17',
  },
  mint: {
    200: '#BFE6D3',
  },
  sand: {
    50: '#FBF8F1',
    100: '#F3EDE0',
  },
  accent: {
    100: '#FDEBD3',
    400: '#F2A33A',
    700: '#B45309',
  },
  neutral: {
    200: '#E5E7EB',
    400: '#9CA3AF',
    600: '#4B5563',
    900: '#1A1F24',
  },
  surface: '#FFFFFF',
  background: '#F7F8F6',
  success: { 700: '#15803D' },
  warning: { 700: '#A16207' },
  danger: { 700: '#B42318' },
  info: { 700: '#1D4ED8' },
} as const;

export const typeScale = {
  'display-xl': { size: 56, lineHeight: 60, weight: 700 },
  display: { size: 28, lineHeight: 34, weight: 700 },
  h1: { size: 24, lineHeight: 30, weight: 700 },
  h2: { size: 20, lineHeight: 26, weight: 600 },
  body: { size: 16, lineHeight: 24, weight: 400 },
  'body-strong': { size: 16, lineHeight: 24, weight: 600 },
  caption: { size: 13, lineHeight: 18, weight: 400 },
  overline: { size: 12, lineHeight: 16, weight: 700, letterSpacing: '0.12em' },
  button: { size: 16, lineHeight: 20, weight: 600 },
} as const;

/** Family names match the keys passed to expo-font `useFonts` in the root layout. */
export const fontFamily = {
  inter: ['Inter_400Regular'],
  'inter-semibold': ['Inter_600SemiBold'],
  'inter-bold': ['Inter_700Bold'],
  display: ['BricolageGrotesque_700Bold'],
  'display-semibold': ['BricolageGrotesque_600SemiBold'],
} as const;

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  24: '96px',
} as const;

export const borderRadius = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '28px',
  full: '9999px',
} as const;

export const elevation = {
  1: '0 1px 2px rgba(10, 31, 23, 0.06), 0 1px 3px rgba(10, 31, 23, 0.08)',
  2: '0 2px 4px rgba(10, 31, 23, 0.05), 0 8px 24px rgba(10, 31, 23, 0.08)',
  3: '0 24px 60px -12px rgba(10, 31, 23, 0.25)',
} as const;

export const motion = {
  fast: '150ms',
  base: '250ms',
  slow: '600ms',
  easeOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
} as const;

type FontSizeTuple = readonly [string, { lineHeight: string; letterSpacing?: string }];

export const fontSize: Record<string, FontSizeTuple> = Object.fromEntries(
  Object.entries(typeScale).map(([name, token]) => {
    const extras = 'letterSpacing' in token ? { letterSpacing: token.letterSpacing } : {};
    return [
      name,
      [`${token.size}px`, { lineHeight: `${token.lineHeight}px`, ...extras }] as FontSizeTuple,
    ];
  }),
);

export function listColorTokens(): ReadonlyArray<{ readonly token: string; readonly hex: string }> {
  const listed: Array<{ token: string; hex: string }> = [];
  for (const [group, value] of Object.entries(colors)) {
    if (typeof value === 'string') {
      listed.push({ token: group, hex: value });
      continue;
    }
    for (const [shade, hex] of Object.entries(value)) {
      listed.push({ token: `${group}-${shade}`, hex });
    }
  }
  return listed;
}
