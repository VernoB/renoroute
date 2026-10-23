import { useEffect, useRef, useState } from 'react';
import { BRAND } from '@renoroute/shared/config/brand';
import type { AppLocale } from '@renoroute/shared/i18n';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  clampOnboardingStep,
  nextOnboardingStep,
  ONBOARDING_STEPS,
  onboardingMotion,
  onboardingStepKeys,
} from '@/features/onboarding/onboarding';
import { setAppLocale } from '@/lib/locale-preference';

const locales = ['fr', 'en'] as const satisfies readonly AppLocale[];

export function WelcomeScreen({
  reduceMotion,
  voiceEnabled,
  onStart,
  onSkip,
  onToggleVoice,
  onStepChange,
  onPressFeedback,
}: {
  reduceMotion: boolean;
  voiceEnabled: boolean;
  onStart: () => void;
  onSkip: () => void;
  onToggleVoice: () => void;
  onStepChange?: (step: number) => void;
  onPressFeedback?: () => void;
}) {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage === 'en' ? 'en' : 'fr';
  const motion = onboardingMotion(reduceMotion);
  const [step, setStep] = useState(0);
  const swipeX = useRef(0);
  const progress = useSharedValue(0);
  const press = useSharedValue(1);
  const keys = onboardingStepKeys(ONBOARDING_STEPS[step] ?? 'estimate');
  const entering = motion.animate ? FadeInDown.duration(motion.durationMs) : undefined;

  useEffect(() => {
    progress.value = motion.animate ? withTiming(step, { duration: motion.durationMs }) : step;
  }, [motion.animate, motion.durationMs, progress, step]);

  const artStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - progress.value) * motion.parallax }],
  }));
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }],
  }));

  function go(next: number) {
    const clamped = clampOnboardingStep(next);
    setStep(clamped);
    onStepChange?.(clamped);
    onPressFeedback?.();
  }

  function onSwipeStart(pageX: number) {
    swipeX.current = pageX;
  }

  function onSwipeEnd(pageX: number) {
    const delta = pageX - swipeX.current;
    if (delta < -48) {
      go(step + 1);
    } else if (delta > 48) {
      go(step - 1);
    }
  }

  return (
    <View className="flex-1 justify-between bg-background px-4 py-6" testID="app-ready">
      <View className="gap-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row gap-2">
            {locales.map((locale) => {
              const selected = current === locale;
              return (
                <Pressable
                  accessibilityLabel={t(`locale.${locale}`)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  className={`min-h-12 min-w-[44px] items-center justify-center rounded-full px-4 ${
                    selected ? 'bg-primary-700' : 'border border-neutral-400 bg-surface'
                  }`}
                  key={locale}
                  onPress={() => {
                    void setAppLocale(locale);
                  }}
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
          <View className="flex-row gap-2">
            <Pressable
              accessibilityLabel={voiceEnabled ? t('onboarding.voiceOff') : t('onboarding.voiceOn')}
              accessibilityRole="button"
              accessibilityState={{ selected: voiceEnabled }}
              className="min-h-12 min-w-[44px] items-center justify-center rounded-full border border-neutral-400 bg-surface px-3"
              onPress={onToggleVoice}
              testID="onboarding-voice"
            >
              <Text className="font-inter-semibold text-button text-neutral-900">
                {voiceEnabled ? t('onboarding.voiceOff') : t('onboarding.voiceOn')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel={t('onboarding.skip')}
              accessibilityRole="button"
              className="min-h-12 min-w-[44px] items-center justify-center px-3"
              onPress={onSkip}
              testID="onboarding-skip"
            >
              <Text className="font-inter-semibold text-button text-primary-700">
                {t('onboarding.skip')}
              </Text>
            </Pressable>
          </View>
        </View>

        <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
          {BRAND.name}
        </Text>
        <Animated.View entering={entering}>
          <Text className="font-display text-h2 text-neutral-900">
            {t('onboarding.valuePromise')}
          </Text>
        </Animated.View>

        <View
          onTouchEnd={(event) => onSwipeEnd(event.nativeEvent.pageX)}
          onTouchStart={(event) => onSwipeStart(event.nativeEvent.pageX)}
        >
          <Animated.View
            accessibilityElementsHidden
            className="h-28 justify-center overflow-hidden rounded-xl bg-primary-50"
            importantForAccessibility="no-hide-descendants"
            style={artStyle}
          >
            <View className="mx-6 h-16 w-16 rounded-2xl bg-primary-700" />
          </Animated.View>
          <View className="mt-3" testID={`onboarding-step-${step}`}>
            <Text className="font-display text-h2 text-neutral-900">{t(keys.title)}</Text>
            <Text className="mt-2 font-inter text-body text-neutral-900">{t(keys.body)}</Text>
          </View>
        </View>

        <View
          accessibilityLabel={t('onboarding.stepLabel', {
            current: step + 1,
            total: ONBOARDING_STEPS.length,
          })}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 1, max: ONBOARDING_STEPS.length, now: step + 1 }}
          className="flex-row items-center gap-2"
          testID="onboarding-dots"
        >
          {ONBOARDING_STEPS.map((id, index) => (
            <View
              className={`h-2 rounded-full ${
                index === step ? 'w-8 bg-primary-700' : 'w-2 bg-neutral-400'
              }`}
              key={id}
            />
          ))}
        </View>
      </View>

      <View className="gap-3">
        {nextOnboardingStep(step) !== 'done' ? (
          <Pressable
            accessibilityLabel={t('onboarding.next')}
            accessibilityRole="button"
            className="min-h-12 items-center justify-center rounded-lg border border-neutral-400 bg-surface px-4"
            onPress={() => go(step + 1)}
            testID="onboarding-next"
          >
            <Text className="font-inter-semibold text-button text-neutral-900">
              {t('onboarding.next')}
            </Text>
          </Pressable>
        ) : null}
        <Animated.View style={pressStyle}>
          <Pressable
            accessibilityLabel={t('auth.start')}
            accessibilityRole="button"
            className="min-h-14 items-center justify-center rounded-lg bg-primary-700 px-4"
            onPress={onStart}
            onPressIn={() => {
              press.value = motion.animate ? withTiming(0.97, { duration: 80 }) : 1;
            }}
            onPressOut={() => {
              press.value = motion.animate ? withTiming(1, { duration: 120 }) : 1;
            }}
            testID="auth-start"
          >
            <Text className="font-inter-semibold text-button text-surface">{t('auth.start')}</Text>
          </Pressable>
        </Animated.View>
        <Pressable
          accessibilityLabel={t('auth.alreadyHaveAccount')}
          accessibilityRole="link"
          className="min-h-12 items-center justify-center"
          onPress={onStart}
        >
          <Text className="font-inter text-body text-primary-700">
            {t('auth.alreadyHaveAccount')}
          </Text>
        </Pressable>
        <Text className="text-center font-inter text-caption text-neutral-600">
          {t('auth.notAffiliated')}
        </Text>
      </View>
    </View>
  );
}
