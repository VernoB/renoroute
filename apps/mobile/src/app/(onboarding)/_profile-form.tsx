import {
  normalizePostalPrefix,
  parseProfileInput,
  profileUtilitiesForProvince,
  provinceCoverage,
  suggestProvinceFromPostal,
  type CanadianProvince,
  type ProfileInput,
  type ProfileUtility,
} from '@renoroute/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, TextInput } from 'react-native';

import { ProvincePicker } from './_province-picker';
import { UtilityPicker } from './_utility-picker';

export type ProfileSaveResult = 'ok' | 'error';

export function ProfileScreen({
  offline,
  onSave,
}: {
  offline: boolean;
  onSave: (value: ProfileInput, notifyWhenReady: boolean) => Promise<ProfileSaveResult>;
}) {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [postalCodeFsa, setPostalCodeFsa] = useState('');
  const [province, setProvince] = useState<CanadianProvince | null>(null);
  const [notify, setNotify] = useState(false);
  const [electricUtility, setElectricUtility] = useState<ProfileUtility>('unknown');
  const [pending, setPending] = useState(false);
  const [invalidFsa, setInvalidFsa] = useState(false);
  const [failed, setFailed] = useState(false);

  async function submit() {
    const parsed = parseProfileInput({ fullName, postalCodeFsa, electricUtility, province });
    if (!parsed.ok) {
      setInvalidFsa(parsed.field === 'postalCodeFsa');
      return;
    }
    setInvalidFsa(false);
    setPending(true);
    setFailed(false);
    try {
      const result = await onSave(
        parsed.value,
        notify && provinceCoverage(parsed.value.province).level === 'federal_only',
      );
      setFailed(result !== 'ok');
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  function chooseProvince(next: CanadianProvince) {
    setProvince(next);
    setElectricUtility((current) =>
      profileUtilitiesForProvince(next).includes(current) ? current : 'unknown',
    );
  }

  const coverage = province ? provinceCoverage(province) : null;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 px-4 pb-8 pt-6">
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t('profile.title')}
      </Text>
      {offline ? (
        <Text className="font-inter text-body text-danger-700">{t('auth.offline')}</Text>
      ) : null}
      <Text className="font-inter-semibold text-body text-neutral-900">
        {t('profile.firstName')}
      </Text>
      <TextInput
        accessibilityLabel={t('profile.firstName')}
        autoComplete="given-name"
        className="min-h-12 rounded-lg border border-neutral-400 bg-surface px-3 font-inter text-body text-neutral-900"
        onChangeText={setFullName}
        testID="profile-first-name"
        value={fullName}
      />
      <Text className="font-inter-semibold text-body text-neutral-900">{t('profile.fsa')}</Text>
      <TextInput
        accessibilityLabel={t('profile.fsa')}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        className="min-h-12 rounded-lg border border-neutral-400 bg-surface px-3 font-inter text-body text-neutral-900"
        onChangeText={(value) => {
          const next = normalizePostalPrefix(value);
          setPostalCodeFsa(next);
          const suggested = suggestProvinceFromPostal(next);
          if (suggested) {
            chooseProvince(suggested);
          }
        }}
        testID="profile-postal-code"
        value={postalCodeFsa}
      />
      <Text className="font-inter text-caption text-neutral-600">{t('profile.fsaHint')}</Text>
      {invalidFsa ? (
        <Text className="font-inter text-body text-danger-700">{t('profile.fsaError')}</Text>
      ) : null}
      <ProvincePicker onChange={chooseProvince} province={province} />
      {coverage ? (
        <Text className="font-inter text-body text-neutral-700">
          {t(coverage.level === 'full' ? 'profile.coverageFull' : 'profile.coverageFederal')}
        </Text>
      ) : null}
      {coverage?.level === 'federal_only' ? (
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: notify }}
          className="min-h-14 justify-center"
          onPress={() => {
            setNotify((value) => !value);
          }}
        >
          <Text className="font-inter text-body text-neutral-900">{t('profile.waitlist')}</Text>
        </Pressable>
      ) : null}
      {coverage && !coverage.utilitiesVerified ? (
        <Text className="font-inter text-caption text-neutral-700" testID="profile-utility-note">
          {t('profile.utilityUnverified')}
        </Text>
      ) : null}
      <UtilityPicker
        onChange={setElectricUtility}
        options={profileUtilitiesForProvince(province)}
        utility={electricUtility}
      />
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
