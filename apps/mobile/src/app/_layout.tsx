import '../global.css';
import '@/lib/i18n';

import {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
} from '@expo-google-fonts/bricolage-grotesque';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PostHogProvider } from 'posthog-react-native';

import { analytics, captureAppOpened } from '@/lib/analytics';
import { hydrateLocale } from '@/lib/locale-preference';
import { wrapWithSentry } from '@/lib/sentry';

void SplashScreen.preventAutoHideAsync();

export function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
  });
  const [localeReady, setLocaleReady] = useState(false);

  useEffect(() => {
    captureAppOpened();
  }, []);

  useEffect(() => {
    void hydrateLocale().finally(() => {
      setLocaleReady(true);
    });
  }, []);

  useEffect(() => {
    if ((loaded || error) && localeReady) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error, localeReady]);

  if ((!loaded && !error) || !localeReady) {
    return null;
  }

  const stack = (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );

  if (!analytics) {
    return stack;
  }

  return (
    <PostHogProvider
      autocapture={{ captureScreens: true, captureTouches: false }}
      client={analytics}
    >
      {stack}
    </PostHogProvider>
  );
}

export default wrapWithSentry(RootLayout);
