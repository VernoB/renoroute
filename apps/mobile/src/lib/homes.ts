import {
  homeInputToUpdate,
  homeRowToInput,
  mergeHomeUpdate,
  type HomeInput,
  type PlanProgress,
} from '@renoroute/shared';
import type { Database } from '@renoroute/shared/types/database';

import { supabase } from '@/lib/supabase';

type HomeRow = Database['public']['Tables']['homes']['Row'];
type PhotoCategory = Database['public']['Enums']['photo_category'];

export type LoadedHome = {
  row: HomeRow;
  input: HomeInput;
};

export async function currentUserId(): Promise<string | null> {
  if (!supabase) {
    return null;
  }
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

export async function loadFirstHome(userId: string): Promise<LoadedHome | null> {
  if (!supabase) {
    return null;
  }
  const { data, error } = await supabase
    .from('homes')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !data) {
    return null;
  }
  return { row: data, input: homeRowToInput(data) };
}

export async function saveHomeDraft(userId: string, draft: HomeInput): Promise<'ok' | 'error'> {
  if (!supabase) {
    return 'error';
  }
  const existing = await loadFirstHome(userId);
  if (existing) {
    const { error } = await supabase
      .from('homes')
      .update(mergeHomeUpdate(existing.row, draft))
      .eq('id', existing.row.id)
      .eq('owner_id', userId);
    return error ? 'error' : 'ok';
  }
  const { error } = await supabase.from('homes').insert({
    owner_id: userId,
    ...homeInputToUpdate(draft),
  });
  return error ? 'error' : 'ok';
}

export async function loadPhotoCounts(
  homeId: string,
): Promise<Partial<Record<PhotoCategory, number>>> {
  if (!supabase) {
    return {};
  }
  const { data, error } = await supabase.from('home_photos').select('category').eq('home_id', homeId);
  if (error || !data) {
    return {};
  }
  const counts: Partial<Record<PhotoCategory, number>> = {};
  for (const row of data) {
    counts[row.category] = (counts[row.category] ?? 0) + 1;
  }
  return counts;
}

export async function loadConsentAiAt(userId: string): Promise<string | null> {
  if (!supabase) {
    return null;
  }
  const { data } = await supabase.from('profiles').select('consent_ai_at').eq('id', userId).maybeSingle();
  return data?.consent_ai_at ?? null;
}

export async function loadPlanProgress(homeId: string): Promise<PlanProgress> {
  if (!supabase) {
    return 'none';
  }
  const { data } = await supabase
    .from('plans')
    .select('status')
    .eq('home_id', homeId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) {
    return 'none';
  }
  if (data.status === 'unlocked' || data.status === 'preview' || data.status === 'archived') {
    return data.status;
  }
  return 'none';
}

export function photoCountTotal(counts: Partial<Record<PhotoCategory, number>>): number {
  return Object.values(counts).reduce((sum, count) => sum + (count ?? 0), 0);
}
