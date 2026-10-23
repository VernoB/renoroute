import {
  visibleRebatePrograms,
  type RebateDossierItem,
  type RebateProgramSource,
  type RebateRuleAmount,
  type VisibleRebateProgram,
} from '@renoroute/shared';
import type { Database } from '@renoroute/shared/types/database';

import { currentUserId, loadFirstHome } from '@/lib/homes';
import { supabase } from '@/lib/supabase';

type ProgramRow = Database['public']['Tables']['rebate_programs']['Row'];
type RuleRow = Database['public']['Tables']['rebate_rules']['Row'];
type ItemRow = Database['public']['Tables']['rebate_checklist_items']['Row'];

export async function loadVisibleRebates(): Promise<VisibleRebateProgram[]> {
  if (!supabase) {
    return [];
  }
  const userId = await currentUserId();
  const home = userId ? await loadFirstHome(userId) : null;
  const { data: programs } = await supabase
    .from('rebate_programs')
    .select('*')
    .eq('is_published', true);
  const { data: rules } = await supabase.from('rebate_rules').select('*').eq('is_active', true);
  const { data: items } = await supabase
    .from('rebate_checklist_items')
    .select('*')
    .eq('is_published', true);
  const sources = ((programs ?? []) as ProgramRow[]).map((program) =>
    programFromRow(
      program,
      ((rules ?? []) as RuleRow[]).filter((rule) => rule.program_id === program.id),
      ((items ?? []) as ItemRow[]).filter((item) => item.program_id === program.id),
    ),
  );
  return visibleRebatePrograms(sources, home?.row.pre_evaluation_date ?? null);
}

function programFromRow(
  program: ProgramRow,
  rules: readonly RuleRow[],
  items: readonly ItemRow[],
): RebateProgramSource {
  return {
    id: program.id,
    slug: program.slug,
    nameFr: program.name_fr,
    nameEn: program.name_en,
    administrator: program.administrator,
    status: program.status,
    requiresPreEvaluation: program.requires_pre_evaluation,
    completionWindowMonths: program.completion_window_months,
    officialUrl: program.official_url,
    sourceUrl: program.source_url,
    lastVerifiedAt: program.last_verified_at,
    isPublished: program.is_published,
    rules: rules.map((rule): RebateRuleAmount => ({
      id: rule.id,
      measure: rule.measure,
      amountMinCad: numberOrNull(rule.amount_min_cad),
      amountMaxCad: numberOrNull(rule.amount_max_cad),
    })),
    dossierItems: items.map((item): RebateDossierItem => ({
      id: item.id,
      kind: item.kind,
      labelFr: item.label_fr,
      labelEn: item.label_en,
      sourceUrl: item.source_url,
      isPublished: item.is_published,
    })),
  };
}

function numberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}
