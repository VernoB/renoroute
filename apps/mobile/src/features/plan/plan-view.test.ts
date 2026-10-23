import assert from 'node:assert/strict';
import { test } from 'node:test';

import { formatCadRange, isPreviewLocked } from './plan-view.ts';

test('preview locks items after priority 2 until unlocked', () => {
  assert.equal(isPreviewLocked(2, false), false);
  assert.equal(isPreviewLocked(3, false), true);
  assert.equal(isPreviewLocked(3, true), false);
});

test('formatCadRange omits a missing range', () => {
  assert.equal(formatCadRange(null, null, 'en'), null);
  const range = formatCadRange(400, 1200, 'en');
  assert.equal(range?.includes('–'), true);
});
