import { CANADIAN_PROVINCES, coverageLevel, type CanadianProvince } from '@renoroute/shared';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export function ProvincePicker({
  province,
  onChange,
}: {
  province: CanadianProvince | null;
  onChange: (code: CanadianProvince) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const badgeKey =
    province === null
      ? null
      : coverageLevel(province) === 'full'
        ? 'profile.coverageBadgeFull'
        : 'profile.coverageBadgeFederal';
  const choices = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return CANADIAN_PROVINCES.filter((code) => {
      if (!needle) {
        return true;
      }
      const name = t(`profile.province${code}`).toLocaleLowerCase();
      return name.includes(needle) || code.toLocaleLowerCase().includes(needle);
    });
  }, [query, t]);

  return (
    <View className="gap-2">
      <Text className="font-inter-semibold text-body text-neutral-900">
        {t('profile.province')}
      </Text>
      <Pressable
        accessibilityLabel={
          province && badgeKey
            ? `${t(`profile.province${province}`)}. ${t(badgeKey)}`
            : t('profile.province')
        }
        accessibilityRole="button"
        className="min-h-14 flex-col items-start justify-center gap-1 rounded-lg border border-neutral-400 bg-surface px-3 py-2"
        onPress={() => {
          setQuery('');
          setOpen(true);
        }}
        testID="profile-province"
      >
        <Text className="w-full font-inter text-body text-neutral-900">
          {province ? t(`profile.province${province}`) : t('profile.provinceChoose')}
        </Text>
        {badgeKey ? <CoverageBadge label={t(badgeKey)} testID="profile-coverage-badge" /> : null}
      </Pressable>
      <Modal
        animationType="slide"
        onRequestClose={() => {
          setOpen(false);
        }}
        transparent
        visible={open}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(26, 31, 36, 0.4)' }}>
          <View className="max-h-[80%] gap-3 rounded-t-2xl bg-surface px-4 pb-8 pt-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-display text-h2 text-neutral-900">{t('profile.province')}</Text>
              <Pressable
                accessibilityRole="button"
                className="min-h-11 justify-center px-2"
                onPress={() => {
                  setOpen(false);
                }}
              >
                <Text className="font-inter-semibold text-button text-primary-700">
                  {t('profile.provinceClose')}
                </Text>
              </Pressable>
            </View>
            <TextInput
              accessibilityLabel={t('profile.provinceSearch')}
              autoCapitalize="none"
              className="min-h-12 rounded-lg border border-neutral-400 bg-background px-3 font-inter text-body text-neutral-900"
              onChangeText={setQuery}
              placeholder={t('profile.provinceSearch')}
              testID="profile-province-search"
              value={query}
            />
            <ScrollView className="max-h-96">
              {choices.map((code) => {
                const selected = province === code;
                const rowBadge = t(
                  coverageLevel(code) === 'full'
                    ? 'profile.coverageBadgeFull'
                    : 'profile.coverageBadgeFederal',
                );
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${t(`profile.province${code}`)}. ${rowBadge}`}
                    className={`min-h-14 flex-col items-start justify-center gap-1 border-b border-neutral-200 px-1 py-2 ${
                      selected ? 'bg-primary-50' : ''
                    }`}
                    key={code}
                    onPress={() => {
                      onChange(code);
                      setOpen(false);
                    }}
                    testID={`profile-province-${code}`}
                  >
                    <Text className="w-full font-inter text-body text-neutral-900">
                      {t(`profile.province${code}`)}
                    </Text>
                    <CoverageBadge label={rowBadge} />
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function CoverageBadge({ label, testID }: { label: string; testID?: string }) {
  return (
    <Text
      className="rounded-full bg-primary-50 px-2 py-1 font-inter text-caption text-primary-700"
      testID={testID}
    >
      {label}
    </Text>
  );
}
