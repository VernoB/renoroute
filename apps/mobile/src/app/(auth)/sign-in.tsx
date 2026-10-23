import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

import { requestEmailCode } from '@/lib/auth/email-otp';
import { requestSocialSignIn } from '@/lib/auth/social-supabase';

import { SignInScreen } from './_sign-in-form';

export default function SignInRoute() {
  const router = useRouter();
  return (
    <SignInScreen
      onCodeSent={(email) => {
        router.push({ pathname: '/(auth)/verify', params: { email } });
      }}
      platform={Platform.OS}
      requestCode={requestEmailCode}
      signInWithSocial={requestSocialSignIn}
    />
  );
}
