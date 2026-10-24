import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

import {
  authProviderSelectedProperties,
  ONBOARDING_EVENTS,
} from '@/features/onboarding/onboarding';
import { analytics } from '@/lib/analytics';
import { requestEmailCode } from '@/lib/auth/email-otp';
import type { SocialProvider, SocialSignInResult } from '@/lib/auth/social-sign-in';

import { SignInScreen } from './_sign-in-form';

async function requestSocialSignIn(provider: SocialProvider): Promise<SocialSignInResult> {
  const social = await import('@/lib/auth/social-supabase');
  return social.requestSocialSignIn(provider);
}

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
