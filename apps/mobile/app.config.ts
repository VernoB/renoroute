import type { ExpoConfig } from 'expo/config';

import { BRAND } from '@renoroute/shared/config/brand';

import { colors } from './src/theme/tokens.ts';

/** Public Expo project id. Single source; not a credential and not repeated in env files. */
export const EAS_PROJECT_ID = 'f37f3a15-00e6-44a8-9cdd-ae7fe87abd93';

type PublicEnv = {
  SENTRY_ORG?: string;
  SENTRY_PROJECT?: string;
};

export function buildExpoConfig(env: PublicEnv): ExpoConfig {
  const plugins: NonNullable<ExpoConfig['plugins']> = [
    'expo-router',
    ['expo-localization', { supportedLocales: ['fr', 'en'] }],
    [
      'expo-splash-screen',
      {
        backgroundColor: colors.background,
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    [
      'expo-image-picker',
      {
        cameraPermission: `${BRAND.name} a besoin de la caméra pour photographier votre maison. ${BRAND.name} needs the camera to photograph your home.`,
        photosPermission: `${BRAND.name} a besoin de vos photos de rénovation pour bâtir votre plan. ${BRAND.name} needs renovation photos to build your plan.`,
      },
    ],
    [
      'expo-audio',
      {
        microphonePermission: `${BRAND.name} a besoin du micro pour la note vocale. ${BRAND.name} needs the microphone for the voice note.`,
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
      icon: './assets/images/icon.png',
    },
    android: {
      package: BRAND.androidPackage,
      adaptiveIcon: {
        backgroundColor: colors.primary[700],
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
    extra: { eas: { projectId: EAS_PROJECT_ID } },
  };
}

export default buildExpoConfig({
  ...(process.env.SENTRY_ORG ? { SENTRY_ORG: process.env.SENTRY_ORG } : {}),
  ...(process.env.SENTRY_PROJECT ? { SENTRY_PROJECT: process.env.SENTRY_PROJECT } : {}),
});
