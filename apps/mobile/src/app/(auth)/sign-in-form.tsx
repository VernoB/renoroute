import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TextInput, View } from 'react-native';

import { authFailure, isEmailAddress, type AuthFailure } from '@/lib/auth/email-otp-input';

export function SignInScreen({
  requestCode,
  onCodeSent,
}: {
  requestCode: (email: string) => Promise<void>;
  onCodeSent: (email: string) => void;
}) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<AuthFailure | null>(null);
  const canSend = isEmailAddress(email) && !pending;

  async function send() {
    if (!canSend) {
      return;
    }
    setPending(true);
    setFailure(null);
    try {
      await requestCode(email.trim());
      onCodeSent(email.trim());
    } catch (error) {
      setFailure(authFailure(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <View className="flex-1 gap-4 bg-background px-4 pt-6">
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t('auth.emailLabel')}
      </Text>
      <TextInput
        accessibilityLabel={t('auth.emailLabel')}
        autoCapitalize="none"
        autoComplete="email"
        className="min-h-12 rounded-lg border border-neutral-400 bg-surface px-3 font-inter text-body text-neutral-900"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder={t('auth.emailLabel')}
        testID="auth-email"
        value={email}
      />
      {failure ? (
        <Text className="font-inter text-body text-danger-700">
          {t(failure === 'offline' ? 'auth.offline' : 'auth.sendError')}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSend, busy: pending }}
        className="min-h-12 items-center justify-center rounded-lg bg-primary-700 px-4"
        disabled={!canSend}
        onPress={() => send()}
      >
        <Text className="font-inter-semibold text-button text-surface">
          {pending ? t('auth.sending') : t('auth.sendCode')}
        </Text>
      </Pressable>
    </View>
  );
}
