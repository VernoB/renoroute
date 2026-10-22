import assert from 'node:assert/strict';
import { test } from 'node:test';

import { evaluationWindowEnd } from './evaluation-window.ts';

test('evaluationWindowEnd adds the program window to the pre-evaluation date', () => {
  assert.equal(evaluationWindowEnd('2026-01-15', 9), '2026-10-15');
});

test('evaluationWindowEnd stays empty until a pre-evaluation date exists', () => {
  assert.equal(evaluationWindowEnd(null, 9), null);
});
