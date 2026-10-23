import { type AppLocale } from '@renoroute/shared';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { formatCadRange, isPreviewLocked, type PlanMeasureCard, type PlanView } from './plan-view';

export function PlanScreen({
  plan,
  onOpenItem,
  onUnlock,
}: {
  plan: PlanView;
  onOpenItem: (item: PlanMeasureCard) => void;
  onUnlock: () => void;
}) {
  const { t, i18n } = useTranslation();
  const locale: AppLocale = i18n.language === 'en' ? 'en' : 'fr';
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 px-4 pb-8 pt-6">
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t('plan.title')}
      </Text>
      <Text className="font-inter text-caption text-neutral-700">{t('review.disclaimer')}</Text>
      <RangeRow label={t('plan.totalCost')} locale={locale} low={plan.totalCostLowCad} high={plan.totalCostHighCad} />
      <RangeRow
        label={t('plan.annualSavings')}
        locale={locale}
        low={plan.annualSavingsLowCad}
        high={plan.annualSavingsHighCad}
      />
      <RangeRow label={t('plan.rebates')} locale={locale} low={plan.rebateLowCad} high={plan.rebateHighCad} />
      {plan.items.map((item) => {
        const locked = isPreviewLocked(item.priority, plan.unlocked);
        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityState={{ disabled: locked }}
            className="min-h-[44px] gap-1 rounded-lg bg-surface p-4 shadow-1"
            disabled={locked}
            onPress={() => onOpenItem(item)}
            testID={`plan-item-${item.priority}`}
          >
            <Text className="font-display-semibold text-h2 text-neutral-900">
              {locked ? t('plan.lockedItem', { n: item.priority }) : `${item.priority}. ${item.title}`}
            </Text>
            {locked ? null : (
              <>
                <Text className="font-inter text-body text-neutral-700">
                  {formatCadRange(item.costLowCad, item.costHighCad, locale) ?? t('plan.rangeUnknown')}
                </Text>
                {item.confidence ? (
                  <Text className="font-inter text-caption text-neutral-700">
                    {t(`plan.confidence.${item.confidence}`)}
                  </Text>
                ) : null}
              </>
            )}
          </Pressable>
        );
      })}
      {plan.unlocked ? null : (
        <Pressable
          accessibilityRole="button"
          className="min-h-[44px] items-center justify-center rounded-lg bg-primary-700 px-4"
          onPress={onUnlock}
          testID="plan-unlock"
        >
          <Text className="font-inter-semibold text-body text-white">{t('plan.unlock')}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

function RangeRow({
  label,
  locale,
  low,
  high,
}: {
  label: string;
  locale: AppLocale;
  low: number | null;
  high: number | null;
}) {
  const { t } = useTranslation();
  return (
    <View className="gap-1">
      <Text className="font-inter-semibold text-body text-neutral-900">{label}</Text>
      <Text className="font-inter text-body text-neutral-700">
        {formatCadRange(low, high, locale) ?? t('plan.rangeUnknown')}
      </Text>
    </View>
  );
}
