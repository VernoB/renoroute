import type { AppLocale } from '@renoroute/shared';

import { supabase } from '@/lib/supabase';

import type { PlanMeasureCard, PlanView } from './plan-view';

export async function loadLatestPlanView(
  homeId: string,
  locale: AppLocale,
): Promise<PlanView | null> {
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from('plans')
    .select('id')
    .eq('home_id', homeId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data || typeof data.id !== 'string') {
    return null;
  }
  return loadPlanView(data.id, locale);
}

export async function loadPlanView(planId: string, locale: AppLocale): Promise<PlanView | null> {
  if (!supabase) {
    return null;
  }
  const { data: plan } = await supabase
    .from('plans')
    .select(
      'id, unlocked_at, total_cost_low_cad, total_cost_high_cad, annual_savings_low_cad, annual_savings_high_cad, rebates_low_cad, rebates_high_cad',
    )
    .eq('id', planId)
    .maybeSingle();
  if (!plan || typeof plan.id !== 'string') {
    return null;
  }
  const { data: rows } = await supabase
    .from('plan_items')
    .select(
      'id, priority, title_fr, title_en, rationale_fr, rationale_en, cost_low_cad, cost_high_cad, savings_low_cad, savings_high_cad, confidence',
    )
    .eq('plan_id', planId)
    .order('priority', { ascending: true });
  const items: PlanMeasureCard[] = (rows ?? []).flatMap((row) => {
    if (typeof row.id !== 'string' || typeof row.priority !== 'number') {
      return [];
    }
    const confidence =
      row.confidence === 'low' || row.confidence === 'medium' || row.confidence === 'high'
        ? row.confidence
        : null;
    return [
      {
        id: row.id,
        priority: row.priority,
        title: locale === 'en' ? row.title_en : row.title_fr,
        rationale: locale === 'en' ? (row.rationale_en ?? '') : (row.rationale_fr ?? ''),
        costLowCad: numberOrNull(row.cost_low_cad),
        costHighCad: numberOrNull(row.cost_high_cad),
        savingsLowCad: numberOrNull(row.savings_low_cad),
        savingsHighCad: numberOrNull(row.savings_high_cad),
        confidence,
      },
    ];
  });
  return {
    id: plan.id,
    unlocked: typeof plan.unlocked_at === 'string',
    totalCostLowCad: numberOrNull(plan.total_cost_low_cad),
    totalCostHighCad: numberOrNull(plan.total_cost_high_cad),
    annualSavingsLowCad: numberOrNull(plan.annual_savings_low_cad),
    annualSavingsHighCad: numberOrNull(plan.annual_savings_high_cad),
    rebateLowCad: numberOrNull(plan.rebates_low_cad),
    rebateHighCad: numberOrNull(plan.rebates_high_cad),
    items,
  };
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
