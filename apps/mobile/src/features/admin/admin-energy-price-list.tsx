import { canPublishEnergyPrice } from '@renoroute/shared';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';

export type AdminEnergyPriceRow = {
  id: string;
  fuel: string;
  unit: string | null;
  sourceUrl: string | null;
  isPublished: boolean;
};

export function AdminEnergyPriceList({ rows }: { rows: readonly AdminEnergyPriceRow[] }) {
  const { t } = useTranslation();
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 px-4 pb-8 pt-6">
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t('admin.energyPricesTitle')}
      </Text>
      {rows.map((row) => {
        const published = row.isPublished && canPublishEnergyPrice(row.sourceUrl);
        return (
          <View key={row.id} className="min-h-[44px] gap-1 rounded-lg bg-surface p-4 shadow-1">
            <Text className="font-display-semibold text-h2 text-neutral-900">
              {t(`admin.fuel.${row.fuel}`)}
            </Text>
            <Text className="font-inter text-caption text-neutral-700">
              {row.unit ?? t('admin.unitUnknown')}
            </Text>
            <Text className="font-inter text-caption text-neutral-700">
              {published ? t('admin.published') : t('admin.unpublished')}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}
