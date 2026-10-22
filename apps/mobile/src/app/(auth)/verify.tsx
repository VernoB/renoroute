import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TextInput, View } from 'react-native';

import { authFailure, isOtpCode, type AuthFailure } from '@/lib/auth/email-otp-input';
import { requestEmailCode, verifyEmailCode } from '@/lib/auth/email-otp';

export function VerifyScreen({
  email,
  verifyCode = verifyEmailCode,
  resendCode = requestEmailCode,
}: {
  email: string;
  verifyCode?: (email: string, code: string) => Promise<void>;
  resendCode?: (email: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<AuthFailure | null>(null);
  const canVerify = isOtpCode(code) && !pending;

  async function submit() {
    if (!canVerify) {
      return;
    }
    setPending(true);
    setFailure(null);
    try {
      await verifyCode(email, code.trim());
    } catch (error) {
      setFailure(authFailure(error));
    } finally {
      setPending(false);
    }
  }

  async function resend() {
    setFailure(null);
    try {
      await resendCode(email);
    } catch (error) {
      setFailure(authFailure(error));
    }
  }

  return (
    <View className="flex-1 gap-4 bg-background px-4 pt-6">
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t('auth.codeLabel')}
      </Text>
      <TextInput
        accessibilityLabel={t('auth.codeLabel')}
        className="min-h-12 rounded-lg border border-neutral-400 bg-surface px-3 font-inter text-body text-neutral-900"
        keyboardType="number-pad"
        maxLength={6}
        onChangeText={setCode}
        placeholder={t('auth.codeLabel')}
        value={code}
      />
      {failure ? (
        <Text className="font-inter text-body text-danger-700">
          {t(failure === 'offline' ? 'auth.offline' : 'auth.verifyError')}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canVerify, busy: pending }}
        disabled={!canVerify}
        onPress={() => {
          void submit();
        }}
        className="min-h-12 items-center justify-center rounded-lg bg-primary-700 px-4"
      >
        <Text className="font-inter-semibold text-button text-surface">
          {pending ? t('auth.verifying') : t('auth.verify')}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          void resend();
        }}
        className="min-h-12 items-center justify-center"
      >
        <Text className="font-inter text-body text-primary-700">{t('auth.resend')}</Text>
      </Pressable>
    </View>
  );
}

export default function VerifyRoute() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === 'string' ? params.email : '';
  return <VerifyScreen email={email} />;
}
