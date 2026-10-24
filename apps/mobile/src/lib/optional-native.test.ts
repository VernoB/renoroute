import assert from 'node:assert/strict';
import { test } from 'node:test';

import { optionalNative } from './optional-native.ts';

test('optionalNative returns the module when load succeeds', () => {
  assert.equal(
    optionalNative(() => 7),
    7,
  );
});

test('optionalNative returns null when a native module is missing', () => {
  assert.equal(
    optionalNative(() => {
      throw new Error("Cannot find native module 'ExpoSpeech'");
    }),
    null,
  );
});

test('optionalExpo skips load when the native module is not in the binary', async () => {
  const { optionalExpo } = await import('./optional-native.ts');
  let loaded = false;
  assert.equal(
    optionalExpo('ExpoSpeechMissingTest', () => {
      loaded = true;
      return 1;
    }),
    null,
  );
  assert.equal(loaded, false);
});
