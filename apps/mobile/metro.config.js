const path = require('node:path');

const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const { withNativeWind } = require('nativewind/metro');

const config = getSentryExpoConfig(__dirname);

function blockListEntries(value) {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    ...(config.resolver?.extraNodeModules ?? {}),
    tslib: path.resolve(__dirname, '../../node_modules/tslib/tslib.js'),
  },
  // Expo Router's require.context would otherwise bundle colocated RNTL tests.
  blockList: [...blockListEntries(config.resolver?.blockList), /[/\\].*\.test\.[cm]?[tj]sx?$/],
};

module.exports = withNativeWind(config, { input: './src/global.css' });
