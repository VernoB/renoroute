export { BRAND, type Brand } from './config/brand';
export {
  formatCad,
  formatShortDate,
  intlLocale,
  resolveLocale,
  SUPPORTED_LOCALES,
  type AppLocale,
} from './i18n/index.ts';
export {
  FSA_PATTERN,
  parseProfileInput,
  PROFILE_UTILITIES,
  profileInputSchema,
  type ProfileInput,
  type ProfileUtility,
} from './profile/profile-input.ts';
export {
  legalContactEmail,
  legalPageUrl,
  LEGAL_PATHS,
  PROCESSORS,
  RETENTION,
} from './legal/processors.ts';
export {
  canGeneratePlan,
  consentProfileUpdate,
  TERMS_VERSION,
  type ConsentProfileUpdate,
  type ConsentSelection,
} from './consent/plan-consent.ts';
