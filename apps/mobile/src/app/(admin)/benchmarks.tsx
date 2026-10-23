import { useEffect, useState } from 'react';

import { AdminBenchmarkList, type AdminBenchmarkRow } from '@/features/admin/admin-benchmark-list';
import { loadAdminBenchmarks } from '@/features/admin/load-admin';

export default function AdminBenchmarksRoute() {
  const [rows, setRows] = useState<AdminBenchmarkRow[]>([]);

  useEffect(() => {
    void loadAdminBenchmarks().then(setRows);
  }, []);

  return <AdminBenchmarkList rows={rows} />;
}
