import assert from 'node:assert/strict';
import { test } from 'node:test';

import { contrastRatio, meetsAaText } from './contrast.ts';
import { colors } from './tokens.ts';

const textPairs = [
  ['primary-700 on surface', colors.primary[700], colors.surface],
  ['neutral-900 on surface', colors.neutral[900], colors.surface],
  ['neutral-900 on background', colors.neutral[900], colors.background],
  ['neutral-600 on surface', colors.neutral[600], colors.surface],
  ['accent-700 on surface', colors.accent[700], colors.surface],
  ['success-700 on surface', colors.success[700], colors.surface],
  ['warning-700 on surface', colors.warning[700], colors.surface],
  ['danger-700 on surface', colors.danger[700], colors.surface],
  ['info-700 on surface', colors.info[700], colors.surface],
  ['white on primary-700', '#FFFFFF', colors.primary[700]],
  ['white on danger-700', '#FFFFFF', colors.danger[700]],
] as const;

test('documented text token pairs meet WCAG 2.2 AA 4.5:1 in FR/EN UI colors', () => {
  for (const [name, foreground, background] of textPairs) {
    assert.equal(
      meetsAaText(foreground, background),
      true,
      `${name} is ${contrastRatio(foreground, background).toFixed(2)}:1`,
    );
  }
});

test('decorative primary-500 on white stays below AA so it is not used for text', () => {
  assert.equal(meetsAaText(colors.primary[500], colors.surface), false);
});
