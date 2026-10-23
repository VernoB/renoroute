import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { AdminProgramList, type AdminProgramRow } from '@/features/admin/admin-program-list';
import { loadAdminPrograms } from '@/features/admin/load-admin';

export default function AdminRebatesRoute() {
  const router = useRouter();
  const [rows, setRows] = useState<AdminProgramRow[]>([]);

  useEffect(() => {
    void loadAdminPrograms().then(setRows);
  }, []);

  return (
    <AdminProgramList
      onOpen={(id) => {
        router.push({ pathname: '/(admin)/rebates/[id]', params: { id } });
      }}
      rows={rows}
    />
  );
}
