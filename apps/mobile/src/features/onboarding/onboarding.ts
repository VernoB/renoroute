export {
  clampOnboardingStep,
  nextOnboardingStep,
  ONBOARDING_STEPS,
  onboardingEnterDelay,
  onboardingMotion,
  onboardingStepKeys,
  type OnboardingStepId,
} from '@renoroute/shared/onboarding';

export const ONBOARDING_EVENTS = {
  stepViewed: 'onboarding_step_viewed',
  skipped: 'onboarding_skipped',
  authProvider: 'auth_provider_selected',
  voiceToggled: 'voice_toggled',
} as const;

export type AuthAnalyticsProvider = 'apple' | 'google' | 'facebook' | 'tiktok' | 'email';

export function isVoiceEnabledStored(value: string | null): boolean {
  return value === 'on';
}

export function voiceStoreValue(enabled: boolean): 'on' | 'off' {
  return enabled ? 'on' : 'off';
}

export function onboardingStepViewedProperties(step: number): { step: number } {
  return { step };
}

export function onboardingSkippedProperties(fromStep: number): { from_step: number } {
  return { from_step: fromStep };
}

export function authProviderSelectedProperties(provider: AuthAnalyticsProvider): {
  provider: AuthAnalyticsProvider;
} {
  return { provider };
}

export function voiceToggledProperties(enabled: boolean): { enabled: boolean } {
  return { enabled };
}
