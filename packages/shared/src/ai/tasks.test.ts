import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  autoRouterPlugin,
  IMAGE_PREVIEW_ALLOWED_MODELS,
  isImagePreviewEnabled,
  OPENROUTER_AUTO_MODEL,
  selectModel,
  TASK_AUTO_ROUTES,
} from './tasks.ts';

test('defaults every task to the OpenRouter Auto Router', () => {
  assert.equal(selectModel('vision_observe'), OPENROUTER_AUTO_MODEL);
  assert.equal(selectModel('plan_write'), OPENROUTER_AUTO_MODEL);
  assert.equal(selectModel('image_preview'), OPENROUTER_AUTO_MODEL);
  assert.equal(
    selectModel('vision_observe', { AI_VISION_MODEL: 'openrouter/auto' }),
    OPENROUTER_AUTO_MODEL,
  );
  assert.equal(selectModel('plan_write', { AI_PLAN_MODEL: 'replace-me' }), OPENROUTER_AUTO_MODEL);
});

test('a secret can pin one task to a specific model', () => {
  assert.equal(
    selectModel('plan_write', { AI_PLAN_MODEL: 'anthropic/claude-sonnet-4' }),
    'anthropic/claude-sonnet-4',
  );
  assert.equal(
    selectModel('vision_observe', { AI_PLAN_MODEL: 'anthropic/claude-sonnet-4' }),
    OPENROUTER_AUTO_MODEL,
  );
  assert.equal(autoRouterPlugin('plan_write', 'anthropic/claude-sonnet-4'), null);
});

test('Auto Router is configured for vision, plan, and image', () => {
  assert.deepEqual(autoRouterPlugin('vision_observe'), TASK_AUTO_ROUTES.vision_observe);
  assert.deepEqual(autoRouterPlugin('plan_write'), TASK_AUTO_ROUTES.plan_write);
  assert.deepEqual(autoRouterPlugin('image_preview')?.allowed_models, IMAGE_PREVIEW_ALLOWED_MODELS);
  assert.equal(TASK_AUTO_ROUTES.vision_observe.cost_tier, 'high');
  assert.equal(TASK_AUTO_ROUTES.plan_write.cost_tier, 'high');
});

test('image preview can be killed without disabling other AI', () => {
  assert.equal(
    isImagePreviewEnabled({ AI_GENERATION_ENABLED: 'true', AI_IMAGE_PREVIEW_ENABLED: 'false' }),
    false,
  );
  assert.equal(isImagePreviewEnabled({ AI_GENERATION_ENABLED: 'false' }), false);
  assert.equal(isImagePreviewEnabled({}), true);
});
