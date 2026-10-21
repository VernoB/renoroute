import assert from 'node:assert/strict';
import { test } from 'node:test';

import { BRAND } from '@renoroute/shared/config/brand';

import config, { buildExpoConfig, EAS_PROJECT_ID } from './app.config.ts';

test('Expo config reads product identifiers from BRAND', () => {
  assert.equal(config.name, BRAND.name);
  assert.equal(config.slug, BRAND.slug);
  assert.equal(config.scheme, BRAND.scheme);
  assert.equal(config.ios?.bundleIdentifier, BRAND.iosBundleId);
  assert.equal(config.ios?.supportsTablet, false);
  assert.equal(config.android?.package, BRAND.androidPackage);
  assert.equal(config.extra?.eas?.projectId, EAS_PROJECT_ID);
  assert.equal(
    buildExpoConfig({}).plugins?.some((plugin) =>
      Array.isArray(plugin) ? plugin[0] === '@sentry/react-native/expo' : false,
    ),
    false,
  );
  const withSentry = buildExpoConfig({ SENTRY_ORG: 'renoroute', SENTRY_PROJECT: 'mobile' });
  assert.equal(
    withSentry.plugins?.some((plugin) =>
      Array.isArray(plugin) ? plugin[0] === '@sentry/react-native/expo' : false,
    ),
    true,
  );
});
