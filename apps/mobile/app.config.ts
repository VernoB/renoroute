import type { ExpoConfig } from 'expo/config';

import { BRAND } from '@renoroute/shared/config/brand';

/** Public Expo project id from `eas init`. Not a credential. */
export const EAS_PROJECT_ID = 'f37f3a15-00e6-44a8-9cdd-ae7fe87abd93';

type PublicEnv = {
  EAS_PROJECT_ID?: string;
  SENTRY_ORG?: string;
  SENTRY_PROJECT?: string;
};

export function buildExpoConfig(env: PublicEnv): ExpoConfig {
  const easProjectId = env.EAS_PROJECT_ID ?? EAS_PROJECT_ID;
  const plugins: NonNullable<ExpoConfig['plugins']> = [
    'expo-router',
    ['expo-localization', { supportedLocales: ['fr', 'en'] }],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#F7F8F6',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
  ];
  if (env.SENTRY_ORG && env.SENTRY_PROJECT) {
    plugins.push([
      '@sentry/react-native/expo',
      { organization: env.SENTRY_ORG, project: env.SENTRY_PROJECT },
    ]);
  }
  return {
    name: BRAND.name,
    slug: BRAND.slug,
    scheme: BRAND.scheme,
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    icon: './assets/images/icon.png',
    ios: {
      bundleIdentifier: BRAND.iosBundleId,
      supportsTablet: false,
      icon: './assets/expo.icon',
    },
    android: {
      package: BRAND.androidPackage,
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins,
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: { eas: { projectId: easProjectId } },
  };
}

export default buildExpoConfig({
  ...(process.env.EAS_PROJECT_ID ? { EAS_PROJECT_ID: process.env.EAS_PROJECT_ID } : {}),
  ...(process.env.SENTRY_ORG ? { SENTRY_ORG: process.env.SENTRY_ORG } : {}),
  ...(process.env.SENTRY_PROJECT ? { SENTRY_PROJECT: process.env.SENTRY_PROJECT } : {}),
});
