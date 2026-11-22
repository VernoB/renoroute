import { affiliationCopyKey, type AppLocale } from '@renoroute/shared';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text } from 'react-native';

import { BeforeAfterCard } from '@/features/visualize/before-after-card';

import { formatCadRange, type PlanMeasureCard } from './plan-view';

export function PlanItemScreen({
  item,
  beforeUri = null,
  afterUri = null,
  visualizationPending = false,
  onAddPhotos,
  province = 'NB',
}: {
  item: PlanMeasureCard;
  beforeUri?: string | null;
  afterUri?: string | null;
  visualizationPending?: boolean;
  onAddPhotos?: () => void;
  province?: string;
}) {
  const { t, i18n } = useTranslation();
  const locale: AppLocale = i18n.language === 'en' ? 'en' : 'fr';
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 px-4 pb-8 pt-6">
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {item.title}
      </Text>
      <Text className="font-inter text-caption text-neutral-700">
        {t(affiliationCopyKey(province))}
      </Text>
      {onAddPhotos ? (
        <Pressable
          accessibilityRole="button"
          className="min-h-14 items-center justify-center rounded-lg border border-primary-700 px-4"
          onPress={onAddPhotos}
          testID="plan-item-add-photos"
        >
          <Text className="font-inter-semibold text-button text-primary-700">
            {t('photos.addOnItem')}
          </Text>
        </Pressable>
      ) : null}
      <Text className="font-inter text-body text-neutral-700">{item.rationale}</Text>
      <Text className="font-inter-semibold text-body text-neutral-900">{t('plan.totalCost')}</Text>
      <Text className="font-inter text-body text-neutral-700">
        {formatCadRange(item.costLowCad, item.costHighCad, locale) ?? t('plan.rangeUnknown')}
      </Text>
      <Text className="font-inter-semibold text-body text-neutral-900">
        {t('plan.annualSavings')}
      </Text>
      <Text className="font-inter text-body text-neutral-700">
        {formatCadRange(item.savingsLowCad, item.savingsHighCad, locale) ?? t('plan.rangeUnknown')}
      </Text>
      {item.confidence ? (
        <Text className="font-inter text-caption text-neutral-700">
          {t(`plan.confidence.${item.confidence}`)}
        </Text>
      ) : null}
      {beforeUri ? (
        <BeforeAfterCard afterUri={afterUri} beforeUri={beforeUri} pending={visualizationPending} />
      ) : null}
    </ScrollView>
  );
}
