export const ONBOARDING_STEPS = ['estimate', 'rebates', 'file'] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number];

export const ONBOARDING_EVENTS = {
  stepViewed: 'onboarding_step_viewed',
  skipped: 'onboarding_skipped',
  authProvider: 'auth_provider_selected',
  voiceToggled: 'voice_toggled',
} as const;

export type AuthAnalyticsProvider = 'apple' | 'google' | 'facebook' | 'tiktok' | 'email';

export function onboardingStepKeys(id: OnboardingStepId): {
  title: `onboarding.${OnboardingStepId}Title`;
  body: `onboarding.${OnboardingStepId}Body`;
} {
  return {
    title: `onboarding.${id}Title`,
    body: `onboarding.${id}Body`,
  };
}

export function onboardingMotion(reduceMotion: boolean): {
  durationMs: number;
  staggerMs: number;
  parallax: number;
  haptic: boolean;
  animate: boolean;
} {
  if (reduceMotion) {
    return { durationMs: 0, staggerMs: 0, parallax: 0, haptic: false, animate: false };
  }
  return { durationMs: 420, staggerMs: 80, parallax: 28, haptic: true, animate: true };
}

export function clampOnboardingStep(step: number): number {
  if (step < 0) {
    return 0;
  }
  if (step >= ONBOARDING_STEPS.length) {
    return ONBOARDING_STEPS.length - 1;
  }
  return step;
}

export function nextOnboardingStep(step: number): number | 'done' {
  return step >= ONBOARDING_STEPS.length - 1 ? 'done' : step + 1;
}

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
