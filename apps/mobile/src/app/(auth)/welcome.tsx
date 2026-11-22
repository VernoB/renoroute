import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BRAND } from '@renoroute/shared/config/brand';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';

import { loadOptionalModule } from '@/lib/optional-native';

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

function loadSpeech() {
  return loadOptionalModule('ExpoSpeech', () => import('expo-speech'));
}

function loadHaptics() {
  return loadOptionalModule('ExpoHaptics', () => import('expo-haptics'));
}

export default function WelcomeRoute() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const reduceMotion = Boolean(useReducedMotion());
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    void (async () => {
      try {
        const value = await AsyncStorage.getItem(VOICE_KEY);
        setVoiceEnabled(isVoiceEnabledStored(value));
      } catch {
        setVoiceEnabled(false);
      }
    })();
  }, []);

  useEffect(() => {
    analytics?.capture(ONBOARDING_EVENTS.stepViewed, onboardingStepViewedProperties(step));
  }, [step]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const speech = await loadSpeech();
      if (cancelled || !speech) {
        return;
      }
      speech.stop();
      if (!voiceEnabled) {
        return;
      }
      const keys = onboardingStepKeys(ONBOARDING_STEPS[step] ?? 'describe');
      speech.speak(`${t(keys.title)}. ${t(keys.body)}`, {
        language: i18n.language === 'en' ? 'en-CA' : 'fr-CA',
      });
    })();
    return () => {
      cancelled = true;
      void loadSpeech().then((speech) => {
        speech?.stop();
      });
    };
  }, [i18n.language, step, t, voiceEnabled]);

  function goSignIn() {
    void loadSpeech().then((speech) => {
      speech?.stop();
    });
    router.push('/(auth)/sign-in');
  }

  return (
    <WelcomeScreen
      onPressFeedback={() => {
        if (onboardingMotion(reduceMotion).haptic) {
          void loadHaptics().then((haptics) => haptics?.selectionAsync());
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
        void AsyncStorage.setItem(VOICE_KEY, voiceStoreValue(next)).catch(() => undefined);
        analytics?.capture(ONBOARDING_EVENTS.voiceToggled, voiceToggledProperties(next));
        if (!next) {
          void loadSpeech().then((speech) => {
            speech?.stop();
          });
        }
      }}
      reduceMotion={reduceMotion}
      voiceEnabled={voiceEnabled}
    />
  );
}
