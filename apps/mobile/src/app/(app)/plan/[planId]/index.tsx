import { type AppLocale } from '@renoroute/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { loadPlanView } from '@/features/plan/load-plan';
import { PlanScreen } from '@/features/plan/plan-screen';
import type { PlanView } from '@/features/plan/plan-view';

export default function PlanRoute() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const locale: AppLocale = i18n.language === 'en' ? 'en' : 'fr';
  const [plan, setPlan] = useState<PlanView | null>(null);

  useEffect(() => {
    if (!planId) {
      return;
    }
    void loadPlanView(planId, locale).then(setPlan);
  }, [planId, locale]);

  if (!plan) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator accessibilityLabel={t('plan.loading')} />
      </View>
    );
  }

  return (
    <PlanScreen
      onOpenItem={(item) => {
        router.push({
          pathname: '/(app)/plan/[planId]/item/[itemId]',
          params: { planId: plan.id, itemId: item.id },
        });
      }}
      onUnlock={() => {
        router.push({ pathname: '/(app)/plan/[planId]/paywall', params: { planId: plan.id } });
      }}
      plan={plan}
    />
  );
}
