export const SUPPORTED_LOCALES = ['fr', 'en'] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

const DEFAULT_LOCALE: AppLocale = 'fr';

function toSupportedLocale(tag: string | null | undefined): AppLocale | null {
  if (!tag) {
    return null;
  }
  const primary = tag.toLowerCase().split('-')[0];
  if (primary === 'fr' || primary === 'en') {
    return primary;
  }
  return null;
}

/**
 * Saved choice wins, then the device language, then French.
 * The device is the default until the person picks a language.
 */
export function resolveLocale(input: {
  saved: string | null | undefined;
  deviceLanguage: string | null | undefined;
  fallback?: AppLocale;
}): AppLocale {
  return (
    toSupportedLocale(input.saved) ??
    toSupportedLocale(input.deviceLanguage) ??
    input.fallback ??
    DEFAULT_LOCALE
  );
}
