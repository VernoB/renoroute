import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  authProviderSelectedProperties,
  clampOnboardingStep,
  isVoiceEnabledStored,
  nextOnboardingStep,
  ONBOARDING_EVENTS,
  ONBOARDING_STEPS,
  onboardingEnterDelay,
  onboardingMotion,
  onboardingSkippedProperties,
  onboardingStepKeys,
  onboardingStepViewedProperties,
  voiceStoreValue,
  voiceToggledProperties,
} from './onboarding.ts';

test('onboarding has four web-aligned steps and stays muted until the user opts in', () => {
  assert.deepEqual([...ONBOARDING_STEPS], ['describe', 'photos', 'plan', 'checklist']);
  assert.deepEqual(onboardingStepKeys('photos'), {
    title: 'onboarding.photosTitle',
    body: 'onboarding.photosBody',
  });
  assert.equal(isVoiceEnabledStored(null), false);
  assert.equal(isVoiceEnabledStored('off'), false);
  assert.equal(isVoiceEnabledStored('on'), true);
  assert.equal(voiceStoreValue(false), 'off');
});

test('reduce motion keeps short fades and drops travel, stagger, and haptics', () => {
  const reduced = onboardingMotion(true);
  assert.equal(reduced.premium, false);
  assert.equal(reduced.parallax, 0);
  assert.equal(reduced.staggerMs, 0);
  assert.equal(reduced.haptic, false);
  assert.equal(reduced.animate, true);
  assert.equal(reduced.durationMs > 0, true);
  assert.equal(onboardingEnterDelay(true, 3), 0);
  assert.equal(onboardingMotion(false).premium, true);
  assert.equal(onboardingEnterDelay(false, 2), 140);
});

test('step helpers clamp and then mark the last card as done', () => {
  assert.equal(clampOnboardingStep(-2), 0);
  assert.equal(clampOnboardingStep(8), 3);
  assert.equal(nextOnboardingStep(0), 1);
  assert.equal(nextOnboardingStep(3), 'done');
});

test('analytics payloads stay anonymous', () => {
  assert.equal(ONBOARDING_EVENTS.stepViewed, 'onboarding_step_viewed');
  assert.deepEqual(onboardingStepViewedProperties(1), { step: 1 });
  assert.deepEqual(onboardingSkippedProperties(0), { from_step: 0 });
  assert.deepEqual(authProviderSelectedProperties('email'), { provider: 'email' });
  assert.deepEqual(voiceToggledProperties(true), { enabled: true });
  assert.equal(JSON.stringify(onboardingStepViewedProperties(1)).includes('@'), false);
});
