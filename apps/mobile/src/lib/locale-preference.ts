import AsyncStorage from '@react-native-async-storage/async-storage';
import { BRAND } from '@renoroute/shared/config/brand';
import { resolveLocale, type AppLocale } from '@renoroute/shared/i18n';
import { getLocales } from 'expo-localization';

import i18n, { i18nReady } from '@/lib/i18n';

const storageKey = `${BRAND.slug}.locale`;

function deviceLanguage(): string | null {
  return getLocales()[0]?.languageCode ?? null;
}

function fallbackLocale(): AppLocale {
  return process.env.EXPO_PUBLIC_DEFAULT_LOCALE === 'en' ? 'en' : 'fr';
}

/** Apply a previously saved choice. The device language is used until one exists. */
export async function hydrateLocale(): Promise<AppLocale> {
  await i18nReady;
  const saved = await AsyncStorage.getItem(storageKey);
  const locale = resolveLocale({
    saved,
    deviceLanguage: deviceLanguage(),
    fallback: fallbackLocale(),
  });
  if (i18n.language !== locale) {
    await i18n.changeLanguage(locale);
  }
  return locale;
}

/** Persist the in-app switch. Sync to profiles.preferred_locale comes with auth. */
export async function setAppLocale(locale: AppLocale): Promise<void> {
  await i18nReady;
  await AsyncStorage.setItem(storageKey, locale);
  await i18n.changeLanguage(locale);
}
