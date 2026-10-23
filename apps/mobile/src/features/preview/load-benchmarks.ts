import { supabase } from '@/lib/supabase';

import { benchmarkFromDbRow } from './free-preview';

export async function loadActiveBenchmarks() {
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from('measure_benchmarks')
    .select(
      'province, measure, cost_low_cad, cost_high_cad, cost_unit, savings_pct_low, savings_pct_high, is_active',
    )
    .eq('is_active', true);
  return (data ?? []).flatMap((row) => {
    const mapped = benchmarkFromDbRow(row);
    return mapped ? [mapped] : [];
  });
}
