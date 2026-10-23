import { BRAND } from '../config/brand.ts';

/** Draft processor list for the privacy page. Countries are TODO(verify). */
export const PROCESSORS = [
  { name: 'Supabase', country: 'CA', purpose: 'auth_db', note: 'ca-central-1 TODO(verify)' },
  { name: 'Expo', country: 'US', purpose: 'app_build', note: 'TODO(verify)' },
  { name: 'Stripe', country: 'US', purpose: 'payments_web', note: 'TODO(verify)' },
  { name: 'RevenueCat', country: 'US', purpose: 'payments_iap', note: 'TODO(verify)' },
  {
    name: 'Apple',
    country: 'US',
    purpose: 'iap_store_auth',
    note: 'TODO(verify) Sign in with Apple',
  },
  { name: 'Google', country: 'US', purpose: 'iap_store_auth', note: 'TODO(verify) OAuth + Play' },
  { name: 'Meta', country: 'US', purpose: 'auth_facebook', note: 'TODO(verify) Facebook Login' },
  { name: 'TikTok', country: 'US', purpose: 'auth_tiktok', note: 'TODO(verify) Login Kit' },
  { name: 'Sentry', country: 'US', purpose: 'errors', note: 'TODO(verify) host' },
  { name: 'PostHog', country: 'US', purpose: 'analytics', note: 'TODO(verify) US vs EU' },
  {
    name: 'OpenRouter',
    country: 'outside_CA',
    purpose: 'plan_vision_image',
    note: 'TODO(verify) host and models',
  },
  { name: 'GitHub Pages', country: 'US', purpose: 'website', note: 'landing host' },
  { name: 'Bunny Fonts', country: 'EU', purpose: 'fonts', note: 'landing only' },
] as const;

export const RETENTION = {
  waitlistMonths: 24,
  paymentsYears: 6,
  account: 'until_deleted',
  photos: 'until_deleted_or_account',
} as const;

export function legalContactEmail(): string {
  return BRAND.supportEmail;
}

export const LEGAL_PATHS = {
  privacy: 'privacy.html',
  terms: 'terms.html',
  deleteAccount: 'delete-account.html',
} as const;

export function legalPageUrl(
  page: keyof typeof LEGAL_PATHS,
  baseUrl: string = BRAND.websiteUrl,
): string {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return new URL(LEGAL_PATHS[page], base).href;
}
