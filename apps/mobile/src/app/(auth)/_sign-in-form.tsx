import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TextInput, View } from 'react-native';

import { authFailure, isEmailAddress, type AuthFailure } from '@/lib/auth/email-otp-input';
import { SocialProviderIcon } from '@/lib/auth/social-provider-icon';
import {
  socialFailureMessageKey,
  socialProviderLabelKey,
  socialProvidersFor,
  type SocialFailure,
  type SocialProvider,
  type SocialSignInResult,
} from '@/lib/auth/social-sign-in';

export function SignInScreen({
  requestCode,
  onCodeSent,
  platform,
  signInWithSocial,
  onAuthProviderSelected,
}: {
  requestCode: (email: string) => Promise<void>;
  onCodeSent: (email: string) => void;
  platform: string;
  signInWithSocial: (provider: SocialProvider) => Promise<SocialSignInResult>;
  onAuthProviderSelected?: (provider: SocialProvider | 'email') => void;
}) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<AuthFailure | null>(null);
  const [socialProvider, setSocialProvider] = useState<SocialProvider | null>(null);
  const [socialFailure, setSocialFailure] = useState<SocialFailure | null>(null);
  const canSend = isEmailAddress(email) && !pending;
  const socialMessage = socialFailure ? socialFailureMessageKey(socialFailure) : null;

  async function send() {
    if (!canSend) {
      return;
    }
    setPending(true);
    setFailure(null);
    onAuthProviderSelected?.('email');
    try {
      await requestCode(email.trim());
      onCodeSent(email.trim());
    } catch (error) {
      setFailure(authFailure(error));
    } finally {
      setPending(false);
    }
  }

  async function startSocial(provider: SocialProvider) {
    if (socialProvider) {
      return;
    }
    setSocialProvider(provider);
    setSocialFailure(null);
    onAuthProviderSelected?.(provider);
    try {
      const result = await signInWithSocial(provider);
      setSocialFailure(result.ok ? null : result.failure);
    } catch {
      setSocialFailure('rejected');
    } finally {
      setSocialProvider(null);
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
        accessibilityLabel={pending ? t('auth.sending') : t('auth.sendCode')}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSend, busy: pending }}
        className="min-h-14 items-center justify-center rounded-lg bg-primary-700 px-4"
        disabled={!canSend}
        onPress={() => send()}
      >
        <Text className="font-inter-semibold text-button text-surface">
          {pending ? t('auth.sending') : t('auth.sendCode')}
        </Text>
      </Pressable>
      <SocialSignInButtons
        onPress={startSocial}
        pendingProvider={socialProvider}
        platform={platform}
      />
      {socialMessage ? (
        <Text className="font-inter text-body text-danger-700">{t(socialMessage)}</Text>
      ) : null}
    </View>
  );
}

function SocialSignInButtons({
  platform,
  pendingProvider,
  onPress,
}: {
  platform: string;
  pendingProvider: SocialProvider | null;
  onPress: (provider: SocialProvider) => void;
}) {
  const { t } = useTranslation();
  const busy = pendingProvider !== null;
  return (
    <>
      <View
        accessibilityRole="text"
        className="flex-row items-center gap-3 py-1"
        testID="auth-or-divider"
      >
        <View className="h-px flex-1 bg-neutral-400" />
        <Text className="font-inter text-caption text-neutral-600">{t('auth.orContinue')}</Text>
        <View className="h-px flex-1 bg-neutral-400" />
      </View>
      {socialProvidersFor(platform).map((provider) => {
        const pending = pendingProvider === provider;
        return (
          <Pressable
            accessibilityLabel={t(socialProviderLabelKey(provider))}
            accessibilityRole="button"
            accessibilityState={{ busy: pending, disabled: busy }}
            className="min-h-14 flex-row items-center justify-center gap-3 rounded-lg border border-neutral-400 bg-surface px-4"
            disabled={busy}
            key={provider}
            onPress={() => onPress(provider)}
            testID={`auth-social-${provider}`}
          >
            <SocialProviderIcon provider={provider} />
            <Text className="font-inter-semibold text-button text-neutral-900">
              {pending ? t('auth.socialSigningIn') : t(socialProviderLabelKey(provider))}
            </Text>
          </Pressable>
        );
      })}
    </>
  );
}
