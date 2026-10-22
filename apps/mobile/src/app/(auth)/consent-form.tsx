import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { type ConsentSelection } from '@renoroute/shared';

export type ConsentSaveResult = 'ok' | 'error';

function ConsentBox({
  label,
  detail,
  checked,
  onToggle,
}: {
  label: string;
  detail: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      accessibilityHint={detail}
      accessibilityLabel={label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      className="min-h-12 flex-row gap-3 py-2"
      onPress={onToggle}
    >
      <View
        className={`mt-1 h-6 w-6 rounded border-2 border-neutral-900 ${
          checked ? 'bg-primary-700' : 'bg-surface'
        }`}
      />
      <View className="flex-1 gap-1">
        <Text className="font-inter text-body text-neutral-900">{label}</Text>
        <Text className="font-inter text-caption text-neutral-600">{detail}</Text>
      </View>
    </Pressable>
  );
}

export function ConsentScreen({
  offline,
  onSave,
}: {
  offline: boolean;
  onSave: (selection: ConsentSelection) => Promise<ConsentSaveResult>;
}) {
  const { t } = useTranslation();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [aiAccepted, setAiAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const canContinue = termsAccepted && aiAccepted && !pending && !offline;

  async function submit() {
    if (!canContinue) {
      return;
    }
    setPending(true);
    setFailed(false);
    try {
      const result = await onSave({ termsAccepted, aiAccepted, marketingAccepted });
      setFailed(result !== 'ok');
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 px-4 pb-8 pt-6">
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t('consent.title')}
      </Text>
      {offline ? (
        <Text className="font-inter text-body text-danger-700">{t('auth.offline')}</Text>
      ) : null}
      <ConsentBox
        checked={termsAccepted}
        detail={t('consent.termsDetail')}
        label={t('consent.terms')}
        onToggle={() => {
          setTermsAccepted((value) => !value);
        }}
      />
      <ConsentBox
        checked={aiAccepted}
        detail={t('consent.aiDetail')}
        label={t('consent.ai')}
        onToggle={() => {
          setAiAccepted((value) => !value);
        }}
      />
      <ConsentBox
        checked={marketingAccepted}
        detail={t('consent.marketingDetail')}
        label={t('consent.marketing')}
        onToggle={() => {
          setMarketingAccepted((value) => !value);
        }}
      />
      {failed ? (
        <Text className="font-inter text-body text-danger-700">{t('consent.saveError')}</Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canContinue, busy: pending }}
        className={`min-h-12 items-center justify-center rounded-lg px-4 ${
          canContinue ? 'bg-primary-700' : 'bg-neutral-400'
        }`}
        disabled={!canContinue}
        onPress={() => {
          void submit();
        }}
      >
        <Text className="font-inter-semibold text-button text-surface">
          {pending ? t('consent.saving') : t('consent.continue')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
