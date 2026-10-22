import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parsePhotoObservation } from './photo-observation.ts';

test('accepts a valid photo observation', () => {
  const parsed = parsePhotoObservation({
    schema_version: 1,
    category_confirmed: 'window',
    observations: [
      {
        code: 'single_pane_glazing',
        confidence: 'medium',
        note_fr: 'Vitrage simple probable',
        note_en: 'Likely single-pane glazing',
      },
    ],
    equipment: null,
    quality: { usable: true, issue: null },
    pii_detected: false,
  });
  assert.equal(parsed.ok, true);
});

test('rejects an invented observation code', () => {
  const parsed = parsePhotoObservation({
    schema_version: 1,
    category_confirmed: 'window',
    observations: [
      {
        code: 'guaranteed_rebate',
        confidence: 'high',
        note_fr: 'x',
        note_en: 'x',
      },
    ],
    equipment: null,
    quality: { usable: true, issue: null },
    pii_detected: false,
  });
  assert.equal(parsed.ok, false);
});
