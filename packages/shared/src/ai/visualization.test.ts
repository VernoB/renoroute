import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  parseVisualizationInput,
  shouldAttemptVisualization,
  unavailableVisualization,
  visualizationPrompt,
} from './visualization.ts';

const imageDataUrl = 'data:image/jpeg;base64,aGVsbG8=';

test('accepts a jpeg data URL and a short measure hint', () => {
  const parsed = parseVisualizationInput({
    locale: 'fr',
    imageDataUrl,
    measureHint: 'attic insulation',
  });
  assert.equal(parsed.ok, true);
});

test('rejects a non-image payload', () => {
  const parsed = parseVisualizationInput({
    locale: 'en',
    imageDataUrl: 'https://example.com/photo.jpg',
  });
  assert.equal(parsed.ok, false);
});

test('requires AI consent and the image-preview flag', () => {
  assert.equal(
    shouldAttemptVisualization({ env: {}, consentAiAt: '2026-10-22T12:00:00.000Z' }),
    true,
  );
  assert.equal(shouldAttemptVisualization({ env: {}, consentAiAt: null }), false);
  assert.equal(
    shouldAttemptVisualization({
      env: { AI_IMAGE_PREVIEW_ENABLED: 'false' },
      consentAiAt: '2026-10-22T12:00:00.000Z',
    }),
    false,
  );
});

test('unavailable results never include an after image', () => {
  const result = unavailableVisualization('model_unavailable');
  assert.equal(result.available, false);
  assert.equal(result.afterImageDataUrl, null);
});

test('the prompt asks for an illustration of the same house', () => {
  const text = visualizationPrompt({ locale: 'en', imageDataUrl, measureHint: 'windows' });
  assert.match(text, /illustration only/);
  assert.match(text, /windows/);
  assert.doesNotMatch(text, /NB Power|Énergie NB/);
});
