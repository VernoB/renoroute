import { type ConsentSelection, consentProfileUpdate } from '@renoroute/shared';
import { useRouter } from 'expo-router';

import { supabase } from '@/lib/supabase';

import { ConsentScreen, type ConsentSaveResult } from './consent-form';

async function persistConsent(selection: ConsentSelection): Promise<ConsentSaveResult> {
  if (!supabase) {
    return 'error';
  }
  const payload = consentProfileUpdate(selection, new Date().toISOString());
  if (!payload) {
    return 'error';
  }
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) {
    return 'error';
  }
  const { error } = await supabase.from('profiles').update(payload).eq('id', userId);
  return error ? 'error' : 'ok';
}

export default function ConsentRoute() {
  const router = useRouter();
  return (
    <ConsentScreen
      offline={supabase === null}
      onSave={async (selection) => {
        const result = await persistConsent(selection);
        if (result === 'ok') {
          router.replace('/(app)/home');
        }
        return result;
      }}
    />
  );
}
