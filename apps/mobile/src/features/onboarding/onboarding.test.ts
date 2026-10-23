import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  authProviderSelectedProperties,
  clampOnboardingStep,
  isVoiceEnabledStored,
  nextOnboardingStep,
  ONBOARDING_EVENTS,
  ONBOARDING_STEPS,
  onboardingMotion,
  onboardingSkippedProperties,
  onboardingStepKeys,
  onboardingStepViewedProperties,
  voiceStoreValue,
  voiceToggledProperties,
} from './onboarding.ts';

test('onboarding has three steps and stays muted until the user opts in', () => {
  assert.deepEqual([...ONBOARDING_STEPS], ['estimate', 'rebates', 'file']);
  assert.deepEqual(onboardingStepKeys('rebates'), {
    title: 'onboarding.rebatesTitle',
    body: 'onboarding.rebatesBody',
  });
  assert.equal(isVoiceEnabledStored(null), false);
  assert.equal(isVoiceEnabledStored('off'), false);
  assert.equal(isVoiceEnabledStored('on'), true);
  assert.equal(voiceStoreValue(false), 'off');
});

test('reduce motion drops animation travel and haptics', () => {
  assert.deepEqual(onboardingMotion(true), {
    durationMs: 0,
    staggerMs: 0,
    parallax: 0,
    haptic: false,
    animate: false,
  });
  assert.equal(onboardingMotion(false).animate, true);
  assert.equal(onboardingMotion(false).haptic, true);
});

test('step helpers clamp and then mark the last card as done', () => {
  assert.equal(clampOnboardingStep(-2), 0);
  assert.equal(clampOnboardingStep(8), 2);
  assert.equal(nextOnboardingStep(0), 1);
  assert.equal(nextOnboardingStep(2), 'done');
});

test('analytics payloads stay anonymous', () => {
  assert.equal(ONBOARDING_EVENTS.stepViewed, 'onboarding_step_viewed');
  assert.deepEqual(onboardingStepViewedProperties(1), { step: 1 });
  assert.deepEqual(onboardingSkippedProperties(0), { from_step: 0 });
  assert.deepEqual(authProviderSelectedProperties('email'), { provider: 'email' });
  assert.deepEqual(voiceToggledProperties(true), { enabled: true });
  assert.equal(JSON.stringify(onboardingStepViewedProperties(1)).includes('@'), false);
});
