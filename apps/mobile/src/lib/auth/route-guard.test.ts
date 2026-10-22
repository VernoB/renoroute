import assert from 'node:assert/strict';
import { test } from 'node:test';

import { routeForSession } from './route-guard.ts';

test('a signed-out person stays on the auth routes', () => {
  assert.equal(routeForSession({ area: 'admin', hasSession: false, role: null }), 'auth');
  assert.equal(routeForSession({ area: 'app', hasSession: false, role: null }), 'auth');
});

test('a homeowner cannot open the admin area', () => {
  assert.equal(routeForSession({ area: 'admin', hasSession: true, role: 'homeowner' }), 'app');
});

test('a contractor cannot open the admin area', () => {
  assert.equal(routeForSession({ area: 'admin', hasSession: true, role: 'contractor' }), 'app');
});

test('an admin can open the admin area', () => {
  assert.equal(routeForSession({ area: 'admin', hasSession: true, role: 'admin' }), 'admin');
});

test('a signed-in person leaves the auth screens', () => {
  assert.equal(routeForSession({ area: 'auth', hasSession: true, role: 'homeowner' }), 'app');
});
