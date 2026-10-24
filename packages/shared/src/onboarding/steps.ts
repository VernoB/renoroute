/** Shared onboarding cards. Copy matches the landing “how it works” steps (s1–s4). */

export const ONBOARDING_STEPS = ['describe', 'photos', 'plan', 'checklist'] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number];

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
  premium: boolean;
} {
  if (reduceMotion) {
    return {
      durationMs: 160,
      staggerMs: 0,
      parallax: 0,
      haptic: false,
      animate: true,
      premium: false,
    };
  }
  return {
    durationMs: 520,
    staggerMs: 70,
    parallax: 42,
    haptic: true,
    animate: true,
    premium: true,
  };
}

export function onboardingEnterDelay(reduceMotion: boolean, index: number): number {
  return onboardingMotion(reduceMotion).staggerMs * index;
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
