import { useEffect, useState } from 'react';

import {
  AdminEnergyPriceList,
  type AdminEnergyPriceRow,
} from '@/features/admin/admin-energy-price-list';
import { loadAdminEnergyPrices } from '@/features/admin/load-admin';

export default function AdminEnergyPricesRoute() {
  const [rows, setRows] = useState<AdminEnergyPriceRow[]>([]);

  useEffect(() => {
    void loadAdminEnergyPrices().then(setRows);
  }, []);

  return <AdminEnergyPriceList rows={rows} />;
}
