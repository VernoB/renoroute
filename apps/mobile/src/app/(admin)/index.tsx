import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

export default function AdminHomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <View className="flex-1 gap-4 bg-background px-4 pt-6" testID="admin-home">
      <Text accessibilityRole="header" className="font-display text-h1 text-neutral-900">
        {t('admin.title')}
      </Text>
      <AdminLink label={t('admin.openPrograms')} onPress={() => router.push('/(admin)/rebates')} />
      <AdminLink
        label={t('admin.openBenchmarks')}
        onPress={() => router.push('/(admin)/benchmarks')}
      />
      <AdminLink
        label={t('admin.openEnergyPrices')}
        onPress={() => router.push('/(admin)/energy-prices')}
      />
    </View>
  );
}

function AdminLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-[44px] justify-center rounded-lg bg-surface px-4"
      onPress={onPress}
    >
      <Text className="font-inter-semibold text-body text-neutral-900">{label}</Text>
    </Pressable>
  );
}
