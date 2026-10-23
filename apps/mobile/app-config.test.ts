import assert from 'node:assert/strict';
import { test } from 'node:test';

import { BRAND } from '@renoroute/shared/config/brand';

import config, { buildExpoConfig, EAS_PROJECT_ID } from './app.config.ts';
import { colors } from './src/theme/tokens.ts';

test('Expo config reads product identifiers from BRAND', () => {
  assert.equal(config.name, BRAND.name);
  assert.equal(config.slug, BRAND.slug);
  assert.equal(config.scheme, BRAND.scheme);
  assert.equal(config.ios?.bundleIdentifier, BRAND.iosBundleId);
  assert.equal(config.ios?.supportsTablet, false);
  assert.equal(config.android?.package, BRAND.androidPackage);
  assert.equal(config.extra?.eas?.projectId, EAS_PROJECT_ID);
  assert.equal(config.android?.adaptiveIcon?.backgroundColor, colors.primary[700]);
  const picker = config.plugins?.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-image-picker',
  );
  assert.equal(Array.isArray(picker), true);
  if (Array.isArray(picker)) {
    const options = picker[1] as { cameraPermission?: string; photosPermission?: string };
    assert.match(options.cameraPermission ?? '', /caméra|camera/i);
    assert.match(options.photosPermission ?? '', /photos/i);
    assert.match(options.cameraPermission ?? '', new RegExp(BRAND.name));
  }
  const splash = config.plugins?.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen',
  );
  assert.equal(Array.isArray(splash) ? splash[1].backgroundColor : undefined, colors.background);
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
