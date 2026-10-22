import { parseProfileInput, PROFILE_UTILITIES, type ProfileInput } from '@renoroute/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, TextInput } from 'react-native';

export type ProfileSaveResult = 'ok' | 'error';

const utilityKeys = {
  nb_power: 'profile.utilityNbPower',
  saint_john_energy: 'profile.utilitySaintJohn',
  energie_edmundston: 'profile.utilityEdmundston',
  perth_andover: 'profile.utilityPerth',
  unknown: 'profile.utilityUnknown',
} as const;

export function ProfileScreen({
  offline,
  onSave,
}: {
  offline: boolean;
  onSave: (value: ProfileInput) => Promise<ProfileSaveResult>;
}) {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [postalCodeFsa, setPostalCodeFsa] = useState('');
  const [electricUtility, setElectricUtility] =
    useState<(typeof PROFILE_UTILITIES)[number]>('unknown');
  const [pending, setPending] = useState(false);
  const [invalidFsa, setInvalidFsa] = useState(false);
  const [failed, setFailed] = useState(false);

  async function submit() {
    const parsed = parseProfileInput({ fullName, postalCodeFsa, electricUtility });
    if (!parsed.ok) {
      setInvalidFsa(parsed.field === 'postalCodeFsa');
      return;
    }
    setInvalidFsa(false);
    setPending(true);
    setFailed(false);
    try {
      const result = await onSave(parsed.value);
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
        {t('profile.title')}
      </Text>
      {offline ? (
        <Text className="font-inter text-body text-danger-700">{t('auth.offline')}</Text>
      ) : null}
      <TextInput
        accessibilityLabel={t('profile.firstName')}
        autoComplete="given-name"
        className="min-h-12 rounded-lg border border-neutral-400 bg-surface px-3 font-inter text-body text-neutral-900"
        onChangeText={setFullName}
        placeholder={t('profile.firstName')}
        value={fullName}
      />
      <TextInput
        accessibilityLabel={t('profile.fsa')}
        autoCapitalize="characters"
        autoComplete="postal-code"
        className="min-h-12 rounded-lg border border-neutral-400 bg-surface px-3 font-inter text-body text-neutral-900"
        maxLength={3}
        onChangeText={setPostalCodeFsa}
        placeholder={t('profile.fsa')}
        value={postalCodeFsa}
      />
      <Text className="font-inter text-caption text-neutral-600">{t('profile.fsaHint')}</Text>
      {invalidFsa ? (
        <Text className="font-inter text-body text-danger-700">{t('profile.fsaError')}</Text>
      ) : null}
      <Text className="font-inter-semibold text-body text-neutral-900">{t('profile.utility')}</Text>
      {PROFILE_UTILITIES.map((utility) => {
        const selected = electricUtility === utility;
        return (
          <Pressable
            key={utility}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={t(utilityKeys[utility])}
            className={`min-h-12 justify-center rounded-lg border px-3 ${
              selected ? 'border-primary-700 bg-primary-50' : 'border-neutral-400 bg-surface'
            }`}
            onPress={() => {
              setElectricUtility(utility);
            }}
          >
            <Text className="font-inter text-body text-neutral-900">{t(utilityKeys[utility])}</Text>
          </Pressable>
        );
      })}
      {failed ? (
        <Text className="font-inter text-body text-danger-700">{t('profile.saveError')}</Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: pending || offline, busy: pending }}
        className="min-h-12 items-center justify-center rounded-lg bg-primary-700 px-4"
        disabled={pending || offline}
        onPress={() => {
          void submit();
        }}
      >
        <Text className="font-inter-semibold text-button text-surface">
          {pending ? t('profile.saving') : t('profile.save')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
