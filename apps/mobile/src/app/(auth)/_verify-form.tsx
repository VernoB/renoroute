import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { AuthBackdrop } from '@/lib/auth/auth-backdrop';
import { authFailure, isOtpCode, type AuthFailure } from '@/lib/auth/email-otp-input';
import { OTP_LENGTH, OTP_RESEND_SECONDS, otpDigits, otpReady } from '@/lib/auth/otp-code';

export function VerifyScreen({
  email,
  verifyCode,
  resendCode,
  onChangeEmail,
  resendSeconds = OTP_RESEND_SECONDS,
}: {
  email: string;
  verifyCode: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  onChangeEmail: () => void;
  resendSeconds?: number;
}) {
  const { t } = useTranslation();
  const [digits, setDigits] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ''));
  const [pending, setPending] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [failure, setFailure] = useState<AuthFailure | null>(null);
  const [seconds, setSeconds] = useState(resendSeconds);
  const inputs = useRef<Array<{ focus: () => void } | null>>([]);
  const code = digits.join('');
  const submitted = useRef('');

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setSeconds((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [seconds]);

  useEffect(() => {
    if (!otpReady(code) || pending || submitted.current === code) {
      return;
    }
    submitted.current = code;
    void submit(code);
  }, [code, pending]);

  async function submit(next = code) {
    if (!isOtpCode(next) || pending) {
      return;
    }
    setPending(true);
    setFailure(null);
    try {
      await verifyCode(email, next);
      setAccepted(true);
      void import('expo-haptics')
        .then((haptics) => haptics.selectionAsync())
        .catch(() => undefined);
    } catch (error) {
      setFailure(authFailure(error));
      submitted.current = '';
    } finally {
      setPending(false);
    }
  }

  function writeDigits(start: number, raw: string) {
    const next = otpDigits(raw);
    if (next.length === 0) {
      const copy = [...digits];
      copy[start] = '';
      setDigits(copy);
      return;
    }
    const copy = [...digits];
    next.split('').forEach((char, offset) => {
      const index = start + offset;
      if (index < OTP_LENGTH) {
        copy[index] = char;
      }
    });
    setDigits(copy);
    const focus = Math.min(start + next.length, OTP_LENGTH - 1);
    inputs.current[focus]?.focus();
  }

  async function resend() {
    if (seconds > 0) {
      return;
    }
    setFailure(null);
    setSeconds(resendSeconds);
    try {
      await resendCode(email);
    } catch (error) {
      setFailure(authFailure(error));
    }
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 px-4 pb-8 pt-6">
      <AuthBackdrop />
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t('auth.codeLabel')}
      </Text>
      <Text className="font-inter text-body text-neutral-700">{email}</Text>
      <View className="flex-row justify-between gap-2">
        {digits.map((digit, index) => (
          <TextInput
            accessibilityLabel={`${t('auth.codeLabel')} ${index + 1}`}
            autoComplete={index === 0 ? 'sms-otp' : 'off'}
            className="min-h-14 min-w-11 flex-1 rounded-lg border border-neutral-400 bg-surface text-center font-inter text-h2 text-neutral-900"
            importantForAutofill="yes"
            inputMode="numeric"
            key={index}
            keyboardType="number-pad"
            maxLength={index === 0 ? OTP_LENGTH : 1}
            onChangeText={(value) => {
              writeDigits(index, value);
            }}
            ref={(node) => {
              inputs.current[index] = node;
            }}
            testID={`auth-otp-${index}`}
            textContentType="oneTimeCode"
            value={digit}
          />
        ))}
      </View>
      {accepted ? (
        <Text className="font-inter text-body text-primary-700">{t('auth.codeAccepted')}</Text>
      ) : null}
      {failure ? (
        <Text className="font-inter text-body text-danger-700">
          {t(failure === 'offline' ? 'auth.offline' : 'auth.verifyError')}
        </Text>
      ) : null}
      {pending ? (
        <Text className="font-inter text-body text-neutral-700">{t('auth.verifying')}</Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: seconds > 0 }}
        className="min-h-14 items-center justify-center"
        disabled={seconds > 0}
        onPress={() => {
          void resend();
        }}
        testID="auth-resend"
      >
        <Text className="font-inter text-body text-primary-700">
          {seconds > 0 ? t('auth.resendIn', { seconds }) : t('auth.resend')}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        className="min-h-14 items-center justify-center"
        onPress={onChangeEmail}
        testID="auth-change-email"
      >
        <Text className="font-inter text-body text-primary-700">{t('auth.changeEmail')}</Text>
      </Pressable>
    </ScrollView>
  );
}
