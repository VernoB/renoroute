import { type VisibleRebateProgram } from '@renoroute/shared';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Linking, View } from 'react-native';

import { loadVisibleRebates } from '@/features/rebates/load-rebates';
import { RebateProgramScreen } from '@/features/rebates/rebate-program-screen';

export default function RebateProgramRoute() {
  const { t } = useTranslation();
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const [program, setProgram] = useState<VisibleRebateProgram | null | undefined>(undefined);

  useEffect(() => {
    void loadVisibleRebates().then((rows) => {
      setProgram(rows.find((row) => row.id === programId) ?? null);
    });
  }, [programId]);

  if (!program) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator accessibilityLabel={t('rebates.title')} />
      </View>
    );
  }

  return (
    <RebateProgramScreen
      onOpenOfficial={(url) => {
        if (url.startsWith('https://')) {
          void Linking.openURL(url);
        }
      }}
      program={program}
    />
  );
}
