import assert from 'node:assert/strict';
import { test } from 'node:test';

import { WEB_PHOTO_INPUT } from './web-photo-picker.ts';

test('the web photo control accepts a camera capture and an image file', () => {
  assert.equal(WEB_PHOTO_INPUT.type, 'file');
  assert.equal(WEB_PHOTO_INPUT.accept, 'image/*');
  assert.equal(WEB_PHOTO_INPUT.capture, 'environment');
});
