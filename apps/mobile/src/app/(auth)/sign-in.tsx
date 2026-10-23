import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

import {
  authProviderSelectedProperties,
  ONBOARDING_EVENTS,
} from '@/features/onboarding/onboarding';
import { analytics } from '@/lib/analytics';
import { requestEmailCode } from '@/lib/auth/email-otp';
import { requestSocialSignIn } from '@/lib/auth/social-supabase';

import { SignInScreen } from './_sign-in-form';

export default function SignInRoute() {
  const router = useRouter();
  return (
    <SignInScreen
      onAuthProviderSelected={(provider) => {
        analytics?.capture(
          ONBOARDING_EVENTS.authProvider,
          authProviderSelectedProperties(provider),
        );
      }}
      onCodeSent={(email) => {
        router.push({ pathname: '/(auth)/verify', params: { email } });
      }}
      platform={Platform.OS}
      requestCode={requestEmailCode}
      signInWithSocial={requestSocialSignIn}
    />
  );
}
