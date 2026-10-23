import { type AppLocale } from '@renoroute/shared';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';

import { loadPlanView } from '@/features/plan/load-plan';
import { PlanItemScreen } from '@/features/plan/plan-item-screen';
import { isPreviewLocked, type PlanMeasureCard } from '@/features/plan/plan-view';

export default function PlanItemRoute() {
  const { t, i18n } = useTranslation();
  const locale: AppLocale = i18n.language === 'en' ? 'en' : 'fr';
  const { planId, itemId } = useLocalSearchParams<{ planId: string; itemId: string }>();
  const [item, setItem] = useState<PlanMeasureCard | null | undefined>(undefined);

  useEffect(() => {
    if (!planId || !itemId) {
      setItem(null);
      return;
    }
    void loadPlanView(planId, locale).then((plan) => {
      const found = plan?.items.find((row) => row.id === itemId) ?? null;
      if (!found || !plan || isPreviewLocked(found.priority, plan.unlocked)) {
        setItem(null);
        return;
      }
      setItem(found);
    });
  }, [planId, itemId, locale]);

  if (item === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator accessibilityLabel={t('plan.loading')} />
      </View>
    );
  }
  if (item === null) {
    return (
      <View className="flex-1 bg-background px-4 pt-6">
        <Text className="font-inter text-body text-neutral-700">{t('plan.itemUnavailable')}</Text>
      </View>
    );
  }
  return <PlanItemScreen item={item} />;
}
