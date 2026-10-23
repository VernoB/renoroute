import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text } from 'react-native';

export default function PlanPreviewPlaceholder() {
  const { t } = useTranslation();
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 px-4 pb-8 pt-6">
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t('plan.loading')}
      </Text>
      <Text className="font-inter text-body text-neutral-700">{t('review.disclaimer')}</Text>
      <Pressable
        accessibilityRole="button"
        className="min-h-[44px] items-center justify-center rounded-lg bg-primary-700 px-4"
        onPress={() => {
          router.push({ pathname: '/(app)/plan/[planId]/paywall', params: { planId: planId ?? '' } });
        }}
      >
        <Text className="font-inter-semibold text-body text-white">{t('payments.title')}</Text>
      </Pressable>
    </ScrollView>
  );
}
