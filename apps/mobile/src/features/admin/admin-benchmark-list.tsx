import { isVerificationStale } from '@renoroute/shared';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';

export type AdminBenchmarkRow = {
  id: string;
  province: string;
  measure: string;
  lastVerifiedAt: string;
  isActive: boolean;
};

export function AdminBenchmarkList({ rows }: { rows: readonly AdminBenchmarkRow[] }) {
  const { t } = useTranslation();
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 px-4 pb-8 pt-6">
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t('admin.benchmarksTitle')}
      </Text>
      {rows.map((row) => (
        <View key={row.id} className="min-h-[44px] gap-1 rounded-lg bg-surface p-4 shadow-1">
          <Text className="font-display-semibold text-h2 text-neutral-900">
            {t(`preview.measure.${row.measure}`)}
          </Text>
          <Text className="font-inter text-caption text-neutral-700">{row.province}</Text>
          <Text className="font-inter text-caption text-neutral-700">
            {isVerificationStale(row.lastVerifiedAt)
              ? t('admin.stale')
              : t('admin.verifiedOn', { date: row.lastVerifiedAt })}
          </Text>
          <Text className="font-inter text-caption text-neutral-700">
            {row.isActive ? t('admin.published') : t('admin.unpublished')}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
