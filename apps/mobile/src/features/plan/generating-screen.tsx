import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  GENERATING_STEP_KEYS,
  GENERATING_STEPS,
  generatingErrorKey,
} from './generating-progress';

export function GeneratingScreen({
  stepIndex,
  errorReason,
  onLeave,
  onRetry,
}: {
  stepIndex: number;
  errorReason: string | null;
  onLeave: () => void;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const current = Math.min(Math.max(stepIndex, 0), GENERATING_STEPS.length - 1);
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 px-4 pb-8 pt-6">
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t('generating.title')}
      </Text>
      <Text className="font-inter text-body text-neutral-700">{t('generating.estimated')}</Text>
      {GENERATING_STEPS.map((step, index) => (
        <View key={step} className="min-h-[44px] justify-center rounded-lg bg-surface p-4 shadow-1">
          <Text
            className={`font-inter text-body ${index <= current ? 'text-neutral-900' : 'text-neutral-500'}`}
            testID={`generating-step-${step}`}
          >
            {t(GENERATING_STEP_KEYS[step])}
          </Text>
        </View>
      ))}
      {errorReason ? (
        <Text className="font-inter text-body text-neutral-700">{t(generatingErrorKey(errorReason))}</Text>
      ) : null}
      {errorReason ? (
        <Pressable
          accessibilityRole="button"
          className="min-h-[44px] items-center justify-center rounded-lg bg-primary-700 px-4"
          onPress={onRetry}
          testID="generating-retry"
        >
          <Text className="font-inter-semibold text-body text-white">{t('generating.retry')}</Text>
        </Pressable>
      ) : null}
      <Pressable
        accessibilityRole="button"
        className="min-h-[44px] items-center justify-center rounded-lg bg-surface px-4"
        onPress={onLeave}
        testID="generating-leave"
      >
        <Text className="font-inter-semibold text-body text-neutral-900">{t('generating.leave')}</Text>
      </Pressable>
    </ScrollView>
  );
}
