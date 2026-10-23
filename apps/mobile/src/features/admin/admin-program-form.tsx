import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

export type AdminRuleRow = {
  id: string;
  measure: string;
  amountMinCad: number | null;
  amountMaxCad: number | null;
};

export function AdminProgramForm({
  nameFr,
  nameEn,
  sourceUrl,
  lastVerifiedAt,
  isPublished,
  rules,
  onMarkVerified,
  onSave,
}: {
  nameFr: string;
  nameEn: string;
  sourceUrl: string;
  lastVerifiedAt: string;
  isPublished: boolean;
  rules: readonly AdminRuleRow[];
  onMarkVerified: () => void;
  onSave: () => void;
}) {
  const { t } = useTranslation();
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 px-4 pb-8 pt-6">
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t('admin.programEdit')}
      </Text>
      <Text className="font-inter text-body text-neutral-900">{nameFr}</Text>
      <Text className="font-inter text-body text-neutral-900">{nameEn}</Text>
      <Text className="font-inter text-caption text-neutral-700">{sourceUrl}</Text>
      <Text className="font-inter text-caption text-neutral-700">
        {t('admin.verifiedOn', { date: lastVerifiedAt })}
      </Text>
      <Text className="font-inter text-caption text-neutral-700">
        {isPublished ? t('admin.published') : t('admin.unpublished')}
      </Text>
      {rules.map((rule) => (
        <View key={rule.id} className="rounded-lg bg-surface p-4">
          <Text className="font-inter text-body text-neutral-900">
            {t(`preview.measure.${rule.measure}`)}
          </Text>
        </View>
      ))}
      <Pressable
        accessibilityRole="button"
        className="min-h-[44px] items-center justify-center rounded-lg bg-surface px-4"
        onPress={onMarkVerified}
        testID="admin-mark-verified"
      >
        <Text className="font-inter-semibold text-body text-neutral-900">
          {t('admin.markVerified')}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        className="min-h-[44px] items-center justify-center rounded-lg bg-primary-700 px-4"
        onPress={onSave}
        testID="admin-save"
      >
        <Text className="font-inter-semibold text-body text-white">{t('admin.save')}</Text>
      </Pressable>
    </ScrollView>
  );
}
