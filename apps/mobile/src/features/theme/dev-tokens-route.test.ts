import assert from 'node:assert/strict';
import { test } from 'node:test';

import { devTokensDestination } from './dev-tokens-route.ts';

test('the token gallery stays on the development route', () => {
  assert.equal(devTokensDestination(true), 'gallery');
});

test('a release build leaves the token gallery for welcome', () => {
  assert.equal(devTokensDestination(false), 'welcome');
});
