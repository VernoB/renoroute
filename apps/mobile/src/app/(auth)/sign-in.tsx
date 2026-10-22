import { useRouter } from 'expo-router';

import { requestEmailCode } from '@/lib/auth/email-otp';

import { SignInScreen } from './sign-in-form';

export default function SignInRoute() {
  const router = useRouter();
  return (
    <SignInScreen
      onCodeSent={(email) => {
        router.push({ pathname: '/(auth)/verify', params: { email } });
      }}
      requestCode={requestEmailCode}
    />
  );
}
