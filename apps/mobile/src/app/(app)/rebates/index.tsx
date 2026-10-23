import { type AppLocale, type VisibleRebateProgram } from '@renoroute/shared';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { loadLatestPlanView } from '@/features/plan/load-plan';
import type { PlanView } from '@/features/plan/plan-view';
import { exportSubsidyPackPdf } from '@/features/rebates/export-pack';
import { loadVisibleRebates } from '@/features/rebates/load-rebates';
import { printHtml } from '@/features/rebates/print-pack';
import { RebateChecklistScreen } from '@/features/rebates/rebate-checklist-screen';
import { currentUserId, loadFirstHome } from '@/lib/homes';

export default function RebatesRoute() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const locale: AppLocale = i18n.language === 'en' ? 'en' : 'fr';
  const [programs, setPrograms] = useState<VisibleRebateProgram[]>([]);
  const [plan, setPlan] = useState<PlanView | null>(null);

  useEffect(() => {
    void loadVisibleRebates().then(setPrograms);
    void loadHomePlan(locale).then(setPlan);
  }, [locale]);

  return (
    <RebateChecklistScreen
      onExportPack={() => {
        void exportSubsidyPackPdf({
          locale,
          plan,
          printer: { print: printHtml },
          programs,
          t,
        });
      }}
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

async function loadHomePlan(locale: AppLocale): Promise<PlanView | null> {
  const userId = await currentUserId();
  const home = userId ? await loadFirstHome(userId) : null;
  if (!home) {
    return null;
  }
  return loadLatestPlanView(home.row.id, locale);
}
