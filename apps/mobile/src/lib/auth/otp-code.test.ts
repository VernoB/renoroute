import assert from 'node:assert/strict';
import { test } from 'node:test';

import { otpDigits, otpReady } from './otp-code.ts';

test('otp keeps six digits from a paste and ignores letters', () => {
  assert.equal(otpDigits('12 34-56 extra'), '123456');
  assert.equal(otpDigits('code 123'), '123');
  assert.equal(otpReady('123456'), true);
  assert.equal(otpReady('12345'), false);
});
