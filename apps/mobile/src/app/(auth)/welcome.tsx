import { BRAND } from '@renoroute/shared/config/brand';
import type { AppLocale } from '@renoroute/shared/i18n';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { setAppLocale } from '@/lib/locale-preference';

const valueKeys = ['auth.valuePlan', 'auth.valueRebates', 'auth.valueCosts'] as const;
const locales = ['fr', 'en'] as const satisfies readonly AppLocale[];

export default function WelcomeScreen() {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage === 'en' ? 'en' : 'fr';

  return (
    <View className="flex-1 justify-between bg-background px-4 py-6" testID="app-ready">
      <View className="gap-6">
        <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
          {BRAND.name}
        </Text>
        <Text className="font-display text-h2 text-neutral-900">{t('auth.welcomeTitle')}</Text>
        <View className="gap-3">
          {valueKeys.map((key) => (
            <Text key={key} className="font-inter text-body text-neutral-900">
              {t(key)}
            </Text>
          ))}
        </View>
        <View className="flex-row gap-3">
          {locales.map((locale) => {
            const selected = current === locale;
            return (
              <Pressable
                key={locale}
                accessibilityRole="button"
                accessibilityLabel={t(`locale.${locale}`)}
                accessibilityState={{ selected }}
                onPress={() => {
                  void setAppLocale(locale);
                }}
                className={`min-h-12 items-center justify-center rounded-full px-4 ${
                  selected ? 'bg-primary-700' : 'border border-neutral-400 bg-surface'
                }`}
              >
                <Text
                  className={
                    selected
                      ? 'font-inter-semibold text-button text-surface'
                      : 'font-inter-semibold text-button text-neutral-900'
                  }
                >
                  {t(`locale.${locale}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View className="gap-4">
        <Link href="/(auth)/sign-in" asChild>
          <Pressable
            accessibilityRole="button"
            className="min-h-12 items-center justify-center rounded-lg bg-primary-700 px-4"
            testID="auth-start"
          >
            <Text className="font-inter-semibold text-button text-surface">{t('auth.start')}</Text>
          </Pressable>
        </Link>
        <Link href="/(auth)/sign-in" asChild>
          <Pressable accessibilityRole="link" className="min-h-12 items-center justify-center">
            <Text className="font-inter text-body text-primary-700">
              {t('auth.alreadyHaveAccount')}
            </Text>
          </Pressable>
        </Link>
        <Text className="text-center font-inter text-caption text-neutral-600">
          {t('auth.notAffiliated')}
        </Text>
      </View>
    </View>
  );
}
