import { legalPageUrl, type ConsentSelection } from '@renoroute/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { AuthBackdrop } from '@/lib/auth/auth-backdrop';

export type ConsentSaveResult = 'ok' | 'error';

function ConsentBox({
  label,
  detail,
  checked,
  onToggle,
  onLearnMore,
}: {
  label: string;
  detail: string;
  checked: boolean;
  onToggle: () => void;
  onLearnMore?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="gap-2 rounded-xl bg-surface p-4 shadow-1">
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
      {onLearnMore ? (
        <Pressable
          accessibilityRole="button"
          className="min-h-11 justify-center"
          onPress={onLearnMore}
        >
          <Text className="font-inter text-body text-primary-700">{t('consent.learnMore')}</Text>
        </Pressable>
      ) : null}
    </View>
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
  const [sheet, setSheet] = useState<'privacy' | 'terms' | null>(null);
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
      <AuthBackdrop />
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
        onLearnMore={() => {
          setSheet('terms');
        }}
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
        className={`min-h-14 items-center justify-center rounded-lg px-4 ${
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
      <Modal animationType="fade" transparent visible={sheet !== null}>
        <View className="flex-1 justify-end bg-neutral-900/40 px-4 pb-8">
          <View className="gap-3 rounded-xl bg-surface p-4">
            <Text accessibilityRole="header" className="font-display text-h2 text-neutral-900">
              {sheet === 'privacy' ? t('consent.privacyTitle') : t('consent.termsTitle')}
            </Text>
            <Pressable
              accessibilityRole="button"
              className="min-h-14 justify-center"
              onPress={() => {
                void Linking.openURL(legalPageUrl('terms'));
              }}
            >
              <Text className="font-inter text-body text-primary-700">
                {t('consent.termsTitle')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="min-h-14 justify-center"
              onPress={() => {
                void Linking.openURL(legalPageUrl('privacy'));
              }}
            >
              <Text className="font-inter text-body text-primary-700">
                {t('consent.privacyTitle')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="min-h-14 items-center justify-center rounded-lg border border-neutral-400"
              onPress={() => {
                setSheet(null);
              }}
            >
              <Text className="font-inter-semibold text-button text-neutral-900">
                {t('consent.close')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
