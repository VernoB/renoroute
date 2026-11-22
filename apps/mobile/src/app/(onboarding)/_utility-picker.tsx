import { PROFILE_UTILITIES } from '@renoroute/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';

const utilityKeys = {
  nb_power: 'profile.utilityNbPower',
  saint_john_energy: 'profile.utilitySaintJohn',
  energie_edmundston: 'profile.utilityEdmundston',
  perth_andover: 'profile.utilityPerth',
  unknown: 'profile.utilityUnknown',
} as const;

export function UtilityPicker({
  utility,
  onChange,
}: {
  utility: (typeof PROFILE_UTILITIES)[number];
  onChange: (value: (typeof PROFILE_UTILITIES)[number]) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <View className="gap-2">
      <Text className="font-inter-semibold text-body text-neutral-900">{t('profile.utility')}</Text>
      <Pressable
        accessibilityLabel={t('profile.utility')}
        accessibilityRole="button"
        className="min-h-14 flex-row items-center justify-between rounded-lg border border-neutral-400 bg-surface px-3"
        onPress={() => {
          setOpen(true);
        }}
        testID="profile-utility"
      >
        <Text className="flex-1 font-inter text-body text-neutral-900">
          {t(utilityKeys[utility])}
        </Text>
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
          <View className="gap-3 rounded-t-2xl bg-surface px-4 pb-8 pt-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-display text-h2 text-neutral-900">{t('profile.utility')}</Text>
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
            {PROFILE_UTILITIES.map((code) => {
              const selected = utility === code;
              return (
                <Pressable
                  accessibilityLabel={t(utilityKeys[code])}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  className={`min-h-14 justify-center rounded-lg border px-3 ${
                    selected ? 'border-primary-700 bg-primary-50' : 'border-neutral-400 bg-surface'
                  }`}
                  key={code}
                  onPress={() => {
                    onChange(code);
                    setOpen(false);
                  }}
                  testID={`profile-utility-${code}`}
                >
                  <Text className="font-inter text-body text-neutral-900">
                    {t(utilityKeys[code])}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}
