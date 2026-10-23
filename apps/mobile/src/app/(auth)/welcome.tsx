import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BRAND } from '@renoroute/shared/config/brand';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';

import {
  isVoiceEnabledStored,
  ONBOARDING_EVENTS,
  ONBOARDING_STEPS,
  onboardingMotion,
  onboardingSkippedProperties,
  onboardingStepKeys,
  onboardingStepViewedProperties,
  voiceStoreValue,
  voiceToggledProperties,
} from '@/features/onboarding/onboarding';
import { analytics } from '@/lib/analytics';

import { WelcomeScreen } from './_welcome-form';

const VOICE_KEY = `${BRAND.slug}.onboarding.voice`;

export default function WelcomeRoute() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const reduceMotion = Boolean(useReducedMotion());
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    void AsyncStorage.getItem(VOICE_KEY).then((value) => {
      setVoiceEnabled(isVoiceEnabledStored(value));
    });
  }, []);

  useEffect(() => {
    analytics?.capture(ONBOARDING_EVENTS.stepViewed, onboardingStepViewedProperties(step));
  }, [step]);

  useEffect(() => {
    Speech.stop();
    if (!voiceEnabled) {
      return undefined;
    }
    const keys = onboardingStepKeys(ONBOARDING_STEPS[step] ?? 'estimate');
    Speech.speak(`${t(keys.title)}. ${t(keys.body)}`, {
      language: i18n.language === 'en' ? 'en-CA' : 'fr-CA',
    });
    return () => {
      Speech.stop();
    };
  }, [i18n.language, step, t, voiceEnabled]);

  function goSignIn() {
    Speech.stop();
    router.push('/(auth)/sign-in');
  }

  return (
    <WelcomeScreen
      onPressFeedback={() => {
        if (onboardingMotion(reduceMotion).haptic) {
          void Haptics.selectionAsync();
        }
      }}
      onSkip={() => {
        analytics?.capture(ONBOARDING_EVENTS.skipped, onboardingSkippedProperties(step));
        goSignIn();
      }}
      onStart={goSignIn}
      onStepChange={setStep}
      onToggleVoice={() => {
        const next = !voiceEnabled;
        setVoiceEnabled(next);
        void AsyncStorage.setItem(VOICE_KEY, voiceStoreValue(next));
        analytics?.capture(ONBOARDING_EVENTS.voiceToggled, voiceToggledProperties(next));
        if (!next) {
          Speech.stop();
        }
      }}
      reduceMotion={reduceMotion}
      voiceEnabled={voiceEnabled}
    />
  );
}
