import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  clampOnboardingStep,
  nextOnboardingStep,
  ONBOARDING_STEPS,
  onboardingEnterDelay,
  onboardingMotion,
  onboardingStepKeys,
} from './steps.ts';

test('shared onboarding lists the four landing how-it-works cards', () => {
  assert.deepEqual([...ONBOARDING_STEPS], ['describe', 'photos', 'plan', 'checklist']);
  assert.deepEqual(onboardingStepKeys('photos'), {
    title: 'onboarding.photosTitle',
    body: 'onboarding.photosBody',
  });
});

test('reduce motion keeps short fades and drops travel', () => {
  const reduced = onboardingMotion(true);
  assert.equal(reduced.premium, false);
  assert.equal(reduced.parallax, 0);
  assert.equal(onboardingEnterDelay(true, 3), 0);
  assert.equal(onboardingEnterDelay(false, 2), 140);
  assert.equal(clampOnboardingStep(9), 3);
  assert.equal(nextOnboardingStep(3), 'done');
});
