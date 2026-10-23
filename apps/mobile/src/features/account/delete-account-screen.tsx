import { deleteConfirmPhrase, type AppLocale } from '@renoroute/shared';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export function DeleteAccountScreen({
  locale,
  typed,
  pending,
  error,
  onChangeTyped,
  onConfirm,
}: {
  locale: AppLocale;
  typed: string;
  pending: boolean;
  error: 'mismatch' | 'failed' | null;
  onChangeTyped: (value: string) => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  const phrase = deleteConfirmPhrase(locale);
  const canDelete = typed === phrase && !pending;
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 px-4 pb-8 pt-6"
      testID="delete-account-screen"
    >
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t('account.deleteTitle')}
      </Text>
      <Text className="font-inter text-body text-neutral-700">{t('account.deleteHint')}</Text>
      <Text className="font-inter text-caption text-neutral-700">{t('account.deleteKept')}</Text>
      <Text className="font-inter text-body text-neutral-900">{t('account.deleteType')}</Text>
      <View>
        <TextInput
          accessibilityLabel={t('account.deleteType')}
          autoCapitalize="characters"
          className="min-h-[44px] rounded-lg bg-surface px-4 font-inter text-body text-neutral-900"
          onChangeText={onChangeTyped}
          testID="delete-confirm-input"
          value={typed}
        />
      </View>
      {error === 'mismatch' ? (
        <Text className="font-inter text-caption text-danger-700">
          {t('account.deleteMismatch')}
        </Text>
      ) : null}
      {error === 'failed' ? (
        <Text className="font-inter text-caption text-danger-700">{t('account.deleteError')}</Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canDelete }}
        className={`min-h-[44px] items-center justify-center rounded-lg px-4 ${
          canDelete ? 'bg-danger-700' : 'bg-neutral-400'
        }`}
        disabled={!canDelete}
        onPress={onConfirm}
        testID="delete-confirm"
      >
        <Text className="font-inter-semibold text-body text-white">
          {t('account.deleteConfirm')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
