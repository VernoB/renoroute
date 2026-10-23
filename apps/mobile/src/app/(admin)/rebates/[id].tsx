import { todayIsoDate } from '@renoroute/shared';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { AdminProgramForm, type AdminRuleRow } from '@/features/admin/admin-program-form';
import type { AdminProgramRow } from '@/features/admin/admin-program-list';
import { loadAdminProgram, markProgramVerifiedToday } from '@/features/admin/load-admin';

export default function AdminRebateEditRoute() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [program, setProgram] = useState<(AdminProgramRow & { sourceUrl: string }) | null>(null);
  const [rules, setRules] = useState<AdminRuleRow[]>([]);

  useEffect(() => {
    if (!id) {
      return;
    }
    void loadAdminProgram(id).then((loaded) => {
      if (!loaded) {
        return;
      }
      setProgram(loaded.program);
      setRules(loaded.rules);
    });
  }, [id]);

  if (!program) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator accessibilityLabel={t('admin.programEdit')} />
      </View>
    );
  }

  return (
    <AdminProgramForm
      isPublished={program.isPublished}
      lastVerifiedAt={program.lastVerifiedAt}
      nameEn={program.nameEn}
      nameFr={program.nameFr}
      onMarkVerified={() => {
        const verifiedOn = todayIsoDate();
        setProgram({ ...program, lastVerifiedAt: verifiedOn });
        void markProgramVerifiedToday(program.id, verifiedOn);
      }}
      onSave={() => {
        void markProgramVerifiedToday(program.id, program.lastVerifiedAt);
      }}
      rules={rules}
      sourceUrl={program.sourceUrl}
    />
  );
}
