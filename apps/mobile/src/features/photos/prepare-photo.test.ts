import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { PHOTO_MAX_EDGE, PHOTO_RECODE_QUALITY, preparePhoto, resizeAction } from './prepare-photo.ts';

const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

test('preparePhoto asks for a 2048 px edge at quality 0.7', () => {
  const result = preparePhoto({ width: 4000, height: 3000, bytes: 1_000_000 });
  assert.deepEqual(result, { maxEdge: 2048, quality: 0.7, reject: false });
  assert.equal(PHOTO_MAX_EDGE, 2048);
  assert.equal(PHOTO_RECODE_QUALITY, 0.7);
});

test('preparePhoto rejects a file over 5 MiB', () => {
  assert.equal(preparePhoto({ width: 800, height: 600, bytes: PHOTO_MAX_BYTES }).reject, false);
  assert.equal(preparePhoto({ width: 800, height: 600, bytes: PHOTO_MAX_BYTES + 1 }).reject, true);
});

test('resizeAction only shrinks the long edge past 2048 px', () => {
  assert.equal(resizeAction(1024, 768, PHOTO_MAX_EDGE), null);
  assert.deepEqual(resizeAction(4000, 3000, PHOTO_MAX_EDGE), { width: PHOTO_MAX_EDGE });
  assert.deepEqual(resizeAction(2000, 4000, PHOTO_MAX_EDGE), { height: PHOTO_MAX_EDGE });
});

test('prepare-photo does not import native capture modules', () => {
  const source = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), 'prepare-photo.ts'),
    'utf8',
  );
  assert.equal(/from ['"]expo-image-manipulator['"]/.test(source), false);
  assert.equal(/from ['"]expo-image-picker['"]/.test(source), false);
  assert.equal(/from ['"]expo-camera['"]/.test(source), false);
});
