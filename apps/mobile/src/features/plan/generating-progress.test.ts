import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  generatingErrorKey,
  parseGeneratePlanResponse,
  stepIndexFromElapsed,
} from './generating-progress.ts';

test('stepIndexFromElapsed advances through the four S12 steps', () => {
  assert.equal(stepIndexFromElapsed(0), 0);
  assert.equal(stepIndexFromElapsed(2499), 0);
  assert.equal(stepIndexFromElapsed(2500), 1);
  assert.equal(stepIndexFromElapsed(8000), 3);
});

test('parseGeneratePlanResponse keeps a fixture plan id and maps errors', () => {
  assert.deepEqual(parseGeneratePlanResponse({ ok: true, planId: 'plan-1' }), {
    ok: true,
    planId: 'plan-1',
  });
  assert.deepEqual(parseGeneratePlanResponse({ ok: false, reason: 'rate_limited' }), {
    ok: false,
    reason: 'rate_limited',
  });
  assert.equal(generatingErrorKey('rate_limited'), 'generating.rateLimited');
  assert.equal(generatingErrorKey('offline'), 'generating.offline');
});
