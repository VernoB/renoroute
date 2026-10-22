import { BRAND } from '@renoroute/shared/config/brand';
import { type AppLocale } from '@renoroute/shared/i18n';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { setAppLocale } from '@/lib/locale-preference';
import { spacing } from '@/theme/tokens';

const swatches = [
  { name: 'primary-700', className: 'bg-primary-700' },
  { name: 'primary-50', className: 'bg-primary-50' },
  { name: 'primary-900', className: 'bg-primary-900' },
  { name: 'primary-500', className: 'bg-primary-500' },
  { name: 'accent-700', className: 'bg-accent-700' },
  { name: 'accent-100', className: 'bg-accent-100' },
  { name: 'accent-400', className: 'bg-accent-400' },
  { name: 'neutral-900', className: 'bg-neutral-900' },
  { name: 'neutral-600', className: 'bg-neutral-600' },
  { name: 'neutral-400', className: 'bg-neutral-400' },
  { name: 'neutral-200', className: 'bg-neutral-200' },
  { name: 'surface', className: 'bg-surface' },
  { name: 'sand-50', className: 'bg-sand-50' },
  { name: 'sand-100', className: 'bg-sand-100' },
  { name: 'forest-950', className: 'bg-forest-950' },
  { name: 'mint-200', className: 'bg-mint-200' },
  { name: 'success-700', className: 'bg-success-700' },
  { name: 'warning-700', className: 'bg-warning-700' },
  { name: 'danger-700', className: 'bg-danger-700' },
  { name: 'info-700', className: 'bg-info-700' },
] as const;

const typeSamples = [
  { name: 'display', className: 'font-display text-display text-neutral-900' },
  { name: 'h1', className: 'font-display text-h1 text-neutral-900' },
  { name: 'h2', className: 'font-display-semibold text-h2 text-neutral-900' },
  { name: 'body', className: 'font-inter text-body text-neutral-900' },
  { name: 'body-strong', className: 'font-inter-semibold text-body text-neutral-900' },
  { name: 'caption', className: 'font-inter text-caption text-neutral-600' },
  { name: 'overline', className: 'font-inter-bold text-overline uppercase text-neutral-600' },
  { name: 'button', className: 'font-inter-semibold text-button text-primary-700' },
] as const;

const spacingSamples = [
  { className: 'w-1', label: spacing[1] },
  { className: 'w-2', label: spacing[2] },
  { className: 'w-3', label: spacing[3] },
  { className: 'w-4', label: spacing[4] },
  { className: 'w-6', label: spacing[6] },
  { className: 'w-8', label: spacing[8] },
  { className: 'w-12', label: spacing[12] },
] as const;

const locales = ['fr', 'en'] as const satisfies readonly AppLocale[];

function LocaleSwitch() {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage === 'en' ? 'en' : 'fr';

  return (
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
            className={`min-h-12 min-w-12 items-center justify-center rounded-full px-4 ${
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
  );
}

function SectionTitle({
  titleKey,
}: {
  titleKey: 'themeDemo.colors' | 'themeDemo.type' | 'themeDemo.spacing';
}) {
  const { t } = useTranslation();
  return (
    <Text accessibilityRole="header" className="font-display-semibold text-h2 text-neutral-900">
      {t(titleKey)}
    </Text>
  );
}

export function TokenDemoScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <ScrollView className="flex-1 bg-background" testID="app-ready">
      <View className="gap-6 px-4 pb-12" style={{ paddingTop: insets.top + 16 }}>
        <Text accessibilityRole="header" className="font-display text-display text-neutral-900">
          {BRAND.name}
        </Text>
        <LocaleSwitch />

        <View className="gap-3">
          <SectionTitle titleKey="themeDemo.colors" />
          {swatches.map((swatch) => (
            <View key={swatch.name} className="flex-row items-center gap-3">
              <View
                accessibilityLabel={swatch.name}
                className={`h-12 w-12 rounded-md border border-neutral-400 ${swatch.className}`}
              />
              <Text className="font-inter text-caption text-neutral-900">{swatch.name}</Text>
            </View>
          ))}
        </View>

        <View className="gap-3 rounded-lg bg-surface p-4">
          <SectionTitle titleKey="themeDemo.type" />
          <Text className="font-inter text-body text-neutral-900">{t('themeDemo.specimen')}</Text>
          {typeSamples.map((sample) => (
            <Text key={sample.name} className={sample.className}>
              {sample.name}
            </Text>
          ))}
        </View>

        <View className="gap-3">
          <SectionTitle titleKey="themeDemo.spacing" />
          {spacingSamples.map((sample) => (
            <View key={sample.label} className="flex-row items-center gap-3">
              <View className={`h-2 bg-primary-700 ${sample.className}`} />
              <Text className="font-inter text-caption text-neutral-600">{sample.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
