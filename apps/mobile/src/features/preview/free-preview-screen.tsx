import { type AppLocale } from '@renoroute/shared';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { formatCadRange } from '@/features/plan/plan-view';

import type { FreePreviewView } from './free-preview';

export function FreePreviewScreen({
  view,
  onContinue,
}: {
  view: FreePreviewView;
  onContinue: () => void;
}) {
  const { t, i18n } = useTranslation();
  const locale: AppLocale = i18n.language === 'en' ? 'en' : 'fr';
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 px-4 pb-8 pt-6"
      testID="free-preview"
    >
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t('preview.title')}
      </Text>
      <Text className="font-inter text-caption text-neutral-700">{t('review.disclaimer')}</Text>
      <RangeRow label={t('preview.totalCost')} locale={locale} range={view.totalCost} />
      <RangeRow label={t('preview.annualSavings')} locale={locale} range={view.totalSavings} />
      {view.estimates.length === 0 ? (
        <Text className="font-inter text-body text-neutral-700">{t('preview.empty')}</Text>
      ) : (
        <Text className="font-display-semibold text-h2 text-neutral-900">
          {t('preview.measures')}
        </Text>
      )}
      {view.estimates.map((item) => (
        <View key={item.measure} className="min-h-[44px] gap-1 rounded-lg bg-surface p-4 shadow-1">
          <Text className="font-display-semibold text-h2 text-neutral-900">
            {t(`preview.measure.${item.measure}`, { defaultValue: t('preview.measure.other') })}
          </Text>
          <Text className="font-inter text-body text-neutral-700">
            {formatCadRange(item.cost.low, item.cost.high, locale) ?? t('plan.rangeUnknown')}
          </Text>
          {item.annualSavingsCad ? (
            <Text className="font-inter text-body text-neutral-700">
              {formatCadRange(item.annualSavingsCad.low, item.annualSavingsCad.high, locale) ??
                t('plan.rangeUnknown')}
            </Text>
          ) : null}
          <Text className="font-inter text-caption text-neutral-700">
            {t(`plan.confidence.${item.confidence}`)}
          </Text>
        </View>
      ))}
      <Pressable
        accessibilityRole="button"
        className="min-h-[44px] items-center justify-center rounded-lg bg-primary-700 px-4"
        onPress={onContinue}
        testID="free-preview-continue"
      >
        <Text className="font-inter-semibold text-body text-white">{t('preview.continue')}</Text>
      </Pressable>
    </ScrollView>
  );
}

function RangeRow({
  label,
  locale,
  range,
}: {
  label: string;
  locale: AppLocale;
  range: { low: number; high: number } | null;
}) {
  const { t } = useTranslation();
  return (
    <View className="gap-1">
      <Text className="font-inter-semibold text-body text-neutral-900">{label}</Text>
      <Text className="font-inter text-body text-neutral-700">
        {range
          ? (formatCadRange(range.low, range.high, locale) ?? t('plan.rangeUnknown'))
          : t('plan.rangeUnknown')}
      </Text>
    </View>
  );
}
