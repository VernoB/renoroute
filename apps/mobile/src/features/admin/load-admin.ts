import { type ProgramStatus, PROGRAM_STATUSES } from '@renoroute/shared';

import { supabase } from '@/lib/supabase';

import type { AdminBenchmarkRow } from './admin-benchmark-list';
import type { AdminEnergyPriceRow } from './admin-energy-price-list';
import type { AdminProgramRow } from './admin-program-list';
import type { AdminRuleRow } from './admin-program-form';

function isStatus(value: unknown): value is ProgramStatus {
  return typeof value === 'string' && (PROGRAM_STATUSES as readonly string[]).includes(value);
}

export async function loadAdminPrograms(): Promise<AdminProgramRow[]> {
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from('rebate_programs')
    .select('id, name_fr, name_en, status, last_verified_at, is_published')
    .order('name_en');
  return (data ?? []).flatMap((row) => {
    if (
      typeof row.id !== 'string' ||
      !isStatus(row.status) ||
      typeof row.last_verified_at !== 'string'
    ) {
      return [];
    }
    return [
      {
        id: row.id,
        nameFr: row.name_fr,
        nameEn: row.name_en,
        status: row.status,
        lastVerifiedAt: row.last_verified_at,
        isPublished: row.is_published === true,
      },
    ];
  });
}

export async function loadAdminProgram(id: string): Promise<{
  program: AdminProgramRow & { sourceUrl: string };
  rules: AdminRuleRow[];
} | null> {
  if (!supabase) {
    return null;
  }
  const { data: program } = await supabase
    .from('rebate_programs')
    .select('id, name_fr, name_en, status, last_verified_at, is_published, source_url')
    .eq('id', id)
    .maybeSingle();
  if (!program || typeof program.id !== 'string' || !isStatus(program.status)) {
    return null;
  }
  const { data: rules } = await supabase
    .from('rebate_rules')
    .select('id, measure, amount_min_cad, amount_max_cad')
    .eq('program_id', id);
  return {
    program: {
      id: program.id,
      nameFr: program.name_fr,
      nameEn: program.name_en,
      status: program.status,
      lastVerifiedAt: program.last_verified_at,
      isPublished: program.is_published === true,
      sourceUrl: program.source_url,
    },
    rules: (rules ?? []).flatMap((row) => {
      if (typeof row.id !== 'string' || typeof row.measure !== 'string') {
        return [];
      }
      return [
        {
          id: row.id,
          measure: row.measure,
          amountMinCad: typeof row.amount_min_cad === 'number' ? row.amount_min_cad : null,
          amountMaxCad: typeof row.amount_max_cad === 'number' ? row.amount_max_cad : null,
        },
      ];
    }),
  };
}

export async function markProgramVerifiedToday(
  id: string,
  verifiedOn: string,
): Promise<'ok' | 'error'> {
  if (!supabase) {
    return 'error';
  }
  const { error } = await supabase
    .from('rebate_programs')
    .update({ last_verified_at: verifiedOn })
    .eq('id', id);
  return error ? 'error' : 'ok';
}

export async function loadAdminBenchmarks(): Promise<AdminBenchmarkRow[]> {
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from('measure_benchmarks')
    .select('id, province, measure, last_verified_at, is_active')
    .order('measure');
  return (data ?? []).flatMap((row) => {
    if (typeof row.id !== 'string' || typeof row.measure !== 'string') {
      return [];
    }
    return [
      {
        id: row.id,
        province: row.province,
        measure: row.measure,
        lastVerifiedAt: row.last_verified_at,
        isActive: row.is_active === true,
      },
    ];
  });
}

export async function loadAdminEnergyPrices(): Promise<AdminEnergyPriceRow[]> {
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from('energy_prices')
    .select('id, fuel, unit, source_url, is_published')
    .order('fuel');
  return (data ?? []).flatMap((row) => {
    if (typeof row.id !== 'string' || typeof row.fuel !== 'string') {
      return [];
    }
    return [
      {
        id: row.id,
        fuel: row.fuel,
        unit: row.unit,
        sourceUrl: row.source_url,
        isPublished: row.is_published === true,
      },
    ];
  });
}
