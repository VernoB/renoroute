import { type AppLocale } from '@renoroute/shared';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text } from 'react-native';

import { formatCadRange, type PlanMeasureCard } from './plan-view';

export function PlanItemScreen({ item }: { item: PlanMeasureCard }) {
  const { t, i18n } = useTranslation();
  const locale: AppLocale = i18n.language === 'en' ? 'en' : 'fr';
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 px-4 pb-8 pt-6">
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {item.title}
      </Text>
      <Text className="font-inter text-caption text-neutral-700">{t('review.disclaimer')}</Text>
      <Text className="font-inter text-body text-neutral-700">{item.rationale}</Text>
      <Text className="font-inter-semibold text-body text-neutral-900">{t('plan.totalCost')}</Text>
      <Text className="font-inter text-body text-neutral-700">
        {formatCadRange(item.costLowCad, item.costHighCad, locale) ?? t('plan.rangeUnknown')}
      </Text>
      <Text className="font-inter-semibold text-body text-neutral-900">{t('plan.annualSavings')}</Text>
      <Text className="font-inter text-body text-neutral-700">
        {formatCadRange(item.savingsLowCad, item.savingsHighCad, locale) ?? t('plan.rangeUnknown')}
      </Text>
      {item.confidence ? (
        <Text className="font-inter text-caption text-neutral-700">
          {t(`plan.confidence.${item.confidence}`)}
        </Text>
      ) : null}
    </ScrollView>
  );
}
