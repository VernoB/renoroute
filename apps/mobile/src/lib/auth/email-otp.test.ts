import assert from 'node:assert/strict';
import { test } from 'node:test';

import { authFailure, isEmailAddress, isOtpCode } from './email-otp-input.ts';

test('email and code checks accept only a full address and a 6-digit code', () => {
  assert.equal(isEmailAddress('a@b.ca'), true);
  assert.equal(isEmailAddress('not-an-email'), false);
  assert.equal(isOtpCode('123456'), true);
  assert.equal(isOtpCode('12345'), false);
});

test('authFailure distinguishes a missing connection from a rejected code', () => {
  assert.equal(authFailure(new Error('offline')), 'offline');
  assert.equal(authFailure(new Error('rejected')), 'rejected');
});
