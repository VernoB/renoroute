import type { AppLocale } from './locale.ts';

const INTL_LOCALE: Record<AppLocale, string> = {
  fr: 'fr-CA',
  en: 'en-CA',
};

export function intlLocale(locale: AppLocale): string {
  return INTL_LOCALE[locale];
}

/** CAD, grouped the Canadian way: fr-CA `1 234,56 $`, en-CA `$1,234.56`. */
export function formatCad(amount: number, locale: AppLocale): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
}

/** Short date: fr-CA `19 oct. 2026`, en-CA `Oct 19, 2026`. The clock is UTC. */
export function formatShortDate(date: Date, locale: AppLocale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
