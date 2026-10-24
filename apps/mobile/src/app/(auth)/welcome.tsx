import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BRAND } from '@renoroute/shared/config/brand';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';

import { optionalExpo } from '@/lib/optional-native';

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

function speech() {
  return optionalExpo('ExpoSpeech', () => require('expo-speech') as typeof import('expo-speech'));
}

function haptics() {
  return optionalExpo('ExpoHaptics', () => require('expo-haptics') as typeof import('expo-haptics'));
}

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
    speech()?.stop();
    if (!voiceEnabled) {
      return undefined;
    }
    const keys = onboardingStepKeys(ONBOARDING_STEPS[step] ?? 'describe');
    speech()?.speak(`${t(keys.title)}. ${t(keys.body)}`, {
      language: i18n.language === 'en' ? 'en-CA' : 'fr-CA',
    });
    return () => {
      speech()?.stop();
    };
  }, [i18n.language, step, t, voiceEnabled]);

  function goSignIn() {
    speech()?.stop();
    router.push('/(auth)/sign-in');
  }

  return (
    <WelcomeScreen
      onPressFeedback={() => {
        if (onboardingMotion(reduceMotion).haptic) {
          void haptics()?.selectionAsync();
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
          speech()?.stop();
        }
      }}
      reduceMotion={reduceMotion}
      voiceEnabled={voiceEnabled}
    />
  );
}
