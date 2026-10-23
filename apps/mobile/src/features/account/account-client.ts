import {
  isDeleteConfirmed,
  parseExportPayload,
  type AppLocale,
  type ExportPayload,
} from '@renoroute/shared';

import { supabase } from '@/lib/supabase';

export type AccountSettings = {
  marketing: boolean;
  aiConsented: boolean;
};

export async function loadAccountSettings(): Promise<AccountSettings> {
  const fallback = { marketing: false, aiConsented: false };
  if (!supabase) {
    return fallback;
  }
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user.id;
  if (!userId) {
    return fallback;
  }
  const { data } = await supabase
    .from('profiles')
    .select('consent_ai_at, consent_marketing')
    .eq('id', userId)
    .maybeSingle();
  return {
    marketing: data?.consent_marketing === true,
    aiConsented: data?.consent_ai_at != null,
  };
}

export async function persistAccountPatch(patch: {
  preferred_locale?: AppLocale;
  consent_ai_at?: null;
  consent_marketing?: boolean;
}): Promise<boolean> {
  if (!supabase) {
    return false;
  }
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) {
    return false;
  }
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  return error === null;
}

export async function signOutAccount(): Promise<void> {
  await supabase?.auth.signOut();
}

export async function requestDataExport(): Promise<ExportPayload | null> {
  if (!supabase) {
    return null;
  }
  const { data, error } = await supabase.functions.invoke('export-my-data');
  if (error || !data || typeof data !== 'object') {
    return null;
  }
  const body = data as { ok?: boolean; payload?: unknown };
  const parsed = body.ok === true ? parseExportPayload(body.payload) : { ok: false as const };
  return parsed.ok ? parsed.value : null;
}

export async function requestAccountDelete(
  confirmation: string,
  locale: AppLocale,
): Promise<'ok' | 'mismatch' | 'failed'> {
  if (!isDeleteConfirmed(confirmation, locale)) {
    return 'mismatch';
  }
  if (!supabase) {
    return 'failed';
  }
  const { data, error } = await supabase.functions.invoke('delete-account', {
    body: { confirmation, locale },
  });
  if (error || !data || typeof data !== 'object') {
    return 'failed';
  }
  return (data as { ok?: boolean }).ok === true ? 'ok' : 'failed';
}
