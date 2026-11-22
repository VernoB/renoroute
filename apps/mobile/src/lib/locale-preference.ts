import AsyncStorage from '@react-native-async-storage/async-storage';
import { BRAND } from '@renoroute/shared/config/brand';
import { resolveLocale, type AppLocale } from '@renoroute/shared/i18n';
import { getLocales } from 'expo-localization';

import i18n, { fallbackLocale, i18nReady } from '@/lib/i18n';

const storageKey = `${BRAND.slug}.locale`;

function deviceLanguage(): string | null {
  return getLocales()[0]?.languageCode ?? null;
}

/** Apply a previously saved choice. The device language is used until one exists. */
export async function hydrateLocale(): Promise<AppLocale> {
  await i18nReady;
  let saved: string | null;
  try {
    saved = await AsyncStorage.getItem(storageKey);
  } catch {
    saved = null;
  }
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
  try {
    await AsyncStorage.setItem(storageKey, locale);
  } catch {
    // Expo Go can miss the native storage module. The chosen language still applies.
  }
  await i18n.changeLanguage(locale);
}
