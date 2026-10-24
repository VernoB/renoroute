import { useEffect, useRef, useState } from 'react';
import { BRAND } from '@renoroute/shared/config/brand';
import type { AppLocale } from '@renoroute/shared/i18n';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import {
  clampOnboardingStep,
  nextOnboardingStep,
  ONBOARDING_STEPS,
  onboardingEnterDelay,
  onboardingMotion,
  onboardingStepKeys,
} from '@/features/onboarding/onboarding';
import { setAppLocale } from '@/lib/locale-preference';

const locales = ['fr', 'en'] as const satisfies readonly AppLocale[];

const easeOut = Easing.bezier(0.22, 1, 0.36, 1);

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
  const nextPress = useSharedValue(1);
  const localeSlide = useSharedValue(current === 'en' ? 1 : 0);
  const voicePulse = useSharedValue(1);
  const keys = onboardingStepKeys(ONBOARDING_STEPS[step] ?? 'describe');

  useEffect(() => {
    progress.value = motion.premium
      ? withTiming(step, { duration: motion.durationMs, easing: easeOut })
      : step;
  }, [motion.durationMs, motion.premium, progress, step]);

  useEffect(() => {
    localeSlide.value = withTiming(current === 'en' ? 1 : 0, {
      duration: motion.durationMs,
      easing: easeOut,
    });
  }, [current, localeSlide, motion.durationMs]);

  useEffect(() => {
    voicePulse.value = voiceEnabled && motion.premium ? withSpring(1.06) : withTiming(1, { duration: 160 });
  }, [motion.premium, voiceEnabled, voicePulse]);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }],
  }));
  const nextPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nextPress.value }],
  }));

  function scalePress(value: { value: number }, down: boolean) {
    value.value = motion.premium && down ? withSpring(0.96) : withSpring(1);
  }
  const localeIndicator = useAnimatedStyle(() => ({
    transform: [{ translateX: localeSlide.value * 104 }],
  }));
  const voiceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: voicePulse.value }],
  }));

  function go(next: number) {
    const clamped = clampOnboardingStep(next);
    setStep(clamped);
    onStepChange?.(clamped);
    onPressFeedback?.();
  }

  function enter(index: number) {
    const delay = onboardingEnterDelay(reduceMotion, index);
    return motion.premium
      ? FadeInDown.duration(motion.durationMs).delay(delay).easing(easeOut)
      : FadeIn.duration(motion.durationMs);
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="flex-grow justify-between px-4 py-6"
      testID={reduceMotion ? 'onboarding-motion-reduced' : 'onboarding-motion-full'}
    >
      <View className="flex-1 justify-between" testID="app-ready">
        <View className="gap-4">
          <Animated.View className="gap-2" entering={enter(0)}>
            <View className="flex-row items-center justify-between">
            <View className="relative h-12 w-[216px] flex-row rounded-full border border-neutral-400 bg-surface p-1">
              <Animated.View
                className="absolute top-1 h-10 w-[104px] rounded-full bg-primary-700"
                style={localeIndicator}
              />
              {locales.map((locale) => {
                const selected = current === locale;
                return (
                  <Pressable
                    accessibilityLabel={t(`locale.${locale}`)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className="z-10 h-10 w-[104px] items-center justify-center"
                      key={locale}
                      onPress={() => {
                        onPressFeedback?.();
                        void setAppLocale(locale);
                      }}
                      testID={`locale-${locale}`}
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
            <Animated.View style={voiceStyle}>
              <Pressable
                accessibilityLabel={voiceEnabled ? t('onboarding.voiceOff') : t('onboarding.voiceOn')}
                accessibilityRole="button"
                accessibilityState={{ selected: voiceEnabled }}
                className={`min-h-12 items-center justify-center self-start rounded-full px-4 ${
                  voiceEnabled ? 'bg-primary-700' : 'border border-neutral-400 bg-surface'
                }`}
                onPress={() => {
                  onPressFeedback?.();
                  onToggleVoice();
                }}
                testID="onboarding-voice"
              >
                <Text
                  className={
                    voiceEnabled
                      ? 'font-inter-semibold text-button text-surface'
                      : 'font-inter-semibold text-button text-neutral-900'
                  }
                >
                  {voiceEnabled ? t('onboarding.voiceOff') : t('onboarding.voiceOn')}
                </Text>
              </Pressable>
            </Animated.View>
          </Animated.View>

          <Animated.View entering={enter(1)}>
            <Text className="font-inter text-caption text-primary-700">{t('onboarding.eyebrow')}</Text>
            <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
              {BRAND.name}
            </Text>
            <Text className="mt-1 font-display text-h2 text-neutral-900">
              {t('onboarding.heroTitle')}
            </Text>
          </Animated.View>
          <Animated.View entering={enter(2)}>
            <Text className="font-inter text-body text-neutral-900">
              {t('onboarding.valuePromise')}
            </Text>
          </Animated.View>

          <View
            onTouchEnd={(event) => {
              const delta = event.nativeEvent.pageX - swipeX.current;
              if (delta < -48) {
                go(step + 1);
              } else if (delta > 48) {
                go(step - 1);
              }
            }}
            onTouchStart={(event) => {
              swipeX.current = event.nativeEvent.pageX;
            }}
          >
            <OnboardingArt progress={progress} reduceMotion={reduceMotion} step={step} />
            <Animated.View
              entering={
                motion.premium
                  ? FadeInDown.duration(motion.durationMs).easing(easeOut)
                  : FadeIn.duration(motion.durationMs)
              }
              exiting={motion.premium ? FadeOutUp.duration(180) : FadeOut.duration(120)}
              key={step}
              testID={`onboarding-step-${step}`}
            >
              <Text className="mt-3 font-display text-h2 text-neutral-900">{t(keys.title)}</Text>
              <Text className="mt-2 font-inter text-body text-neutral-900">{t(keys.body)}</Text>
            </Animated.View>
          </View>

          <Animated.View
            accessibilityLabel={t('onboarding.stepLabel', {
              current: step + 1,
              total: ONBOARDING_STEPS.length,
            })}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 1, max: ONBOARDING_STEPS.length, now: step + 1 }}
            className="flex-row items-center gap-2"
            entering={enter(4)}
            testID="onboarding-dots"
          >
            {ONBOARDING_STEPS.map((id, index) => (
              <ProgressDot index={index} key={id} progress={progress} />
            ))}
          </Animated.View>
        </View>

        <View className="gap-3">
          {nextOnboardingStep(step) !== 'done' ? (
            <Animated.View entering={enter(5)} style={nextPressStyle}>
              <Pressable
                accessibilityLabel={t('onboarding.next')}
                accessibilityRole="button"
                className="min-h-12 items-center justify-center rounded-lg border border-neutral-400 bg-surface px-4"
                onPress={() => go(step + 1)}
                onPressIn={() => scalePress(nextPress, true)}
                onPressOut={() => scalePress(nextPress, false)}
                testID="onboarding-next"
              >
                <Text className="font-inter-semibold text-button text-neutral-900">
                  {t('onboarding.next')}
                </Text>
              </Pressable>
            </Animated.View>
          ) : null}
          <Animated.View entering={enter(6)} style={pressStyle}>
            <Pressable
              accessibilityLabel={t('auth.start')}
              accessibilityRole="button"
              className="min-h-14 items-center justify-center rounded-lg bg-primary-700 px-4"
              onPress={onStart}
              onPressIn={() => scalePress(press, true)}
              onPressOut={() => scalePress(press, false)}
              testID="auth-start"
            >
              <Text className="font-inter-semibold text-button text-surface">{t('auth.start')}</Text>
            </Pressable>
          </Animated.View>
          <Animated.View entering={enter(7)}>
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
          </Animated.View>
        </View>
      </View>
    </ScrollView>
  );
}

function ProgressDot({
  index,
  progress,
}: {
  index: number;
  progress: { value: number };
}) {
  const style = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [index - 1, index, index + 1], [8, 32, 8], 'clamp'),
    opacity: interpolate(progress.value, [index - 1, index, index + 1], [0.35, 1, 0.35], 'clamp'),
  }));
  return <Animated.View className="h-2 rounded-full bg-primary-700" style={style} />;
}

function OnboardingArt({
  step,
  progress,
  reduceMotion,
}: {
  step: number;
  progress: { value: number };
  reduceMotion: boolean;
}) {
  const motion = onboardingMotion(reduceMotion);
  const back = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 3], [motion.parallax, -motion.parallax]) },
    ],
  }));
  const mid = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 3],
          [motion.parallax * 0.55, -motion.parallax * 0.55],
        ),
      },
    ],
  }));
  const front = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 3],
          [motion.parallax * 0.2, -motion.parallax * 0.2],
        ),
      },
      { scale: interpolate(progress.value, [step - 1, step, step + 1], [0.92, 1, 0.92], 'clamp') },
    ],
  }));

  return (
    <View
      accessibilityElementsHidden
      className="h-32 overflow-hidden rounded-xl bg-primary-50"
      importantForAccessibility="no-hide-descendants"
      testID="onboarding-art"
    >
      <Animated.View className="absolute -left-6 top-6 h-24 w-24 rounded-full bg-mint-200" style={back} />
      <Animated.View
        className="absolute right-4 top-4 h-16 w-16 rounded-2xl bg-accent-100"
        style={mid}
      />
      <Animated.View
        className="absolute bottom-5 left-10 h-14 w-20 rounded-2xl bg-primary-700"
        style={front}
      />
    </View>
  );
}
