import { type VisibleRebateProgram } from '@renoroute/shared';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { RebateChecklistScreen } from '@/features/rebates/rebate-checklist-screen';
import { loadVisibleRebates } from '@/features/rebates/load-rebates';

export default function RebatesRoute() {
  const router = useRouter();
  const [programs, setPrograms] = useState<VisibleRebateProgram[]>([]);

  useEffect(() => {
    void loadVisibleRebates().then(setPrograms);
  }, []);

  return (
    <RebateChecklistScreen
      onOpenOfficial={(url) => {
        if (url.startsWith('https://')) {
          void Linking.openURL(url);
        }
      }}
      onOpenProgram={(id) => {
        router.push({ pathname: '/(app)/rebates/[programId]', params: { programId: id } });
      }}
      programs={programs}
    />
  );
}
