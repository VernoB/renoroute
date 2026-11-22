import { useLocalSearchParams, useRouter } from 'expo-router';

import { requestEmailCode, verifyEmailCode } from '@/lib/auth/email-otp';

import { VerifyScreen } from './_verify-form';

export default function VerifyRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === 'string' ? params.email : '';
  return (
    <VerifyScreen
      email={email}
      onChangeEmail={() => {
        router.back();
      }}
      resendCode={requestEmailCode}
      verifyCode={verifyEmailCode}
    />
  );
}
