import { resolveLocale, type AppLocale } from '@renoroute/shared/i18n';
import en from '@renoroute/shared/i18n/en.json';
import fr from '@renoroute/shared/i18n/fr.json';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export function fallbackLocale(): AppLocale {
  return process.env.EXPO_PUBLIC_DEFAULT_LOCALE === 'en' ? 'en' : 'fr';
}

const initial = resolveLocale({
  saved: null,
  deviceLanguage: getLocales()[0]?.languageCode ?? null,
  fallback: fallbackLocale(),
});

export const i18nReady = i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: initial,
  fallbackLng: fallbackLocale(),
  supportedLngs: ['fr', 'en'],
  interpolation: { escapeValue: false },
});

export default i18n;
