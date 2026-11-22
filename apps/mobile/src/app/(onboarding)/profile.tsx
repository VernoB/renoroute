import type { ProfileInput } from '@renoroute/shared';
import { useRouter } from 'expo-router';

import { supabase } from '@/lib/supabase';

import { ProfileScreen, type ProfileSaveResult } from './_profile-form';

async function persistProfile(value: ProfileInput): Promise<ProfileSaveResult> {
  if (!supabase) {
    return 'error';
  }
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) {
    return 'error';
  }
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: value.fullName,
      postal_code_fsa: value.postalCodeFsa,
      province: value.province,
    })
    .eq('id', userId);
  if (profileError) {
    return 'error';
  }

  const { data: homes, error: homesError } = await supabase
    .from('homes')
    .select('id')
    .eq('owner_id', userId)
    .limit(1);
  if (homesError) {
    return 'error';
  }
  const homeId = homes?.[0]?.id;
  if (homeId) {
    const { error } = await supabase
      .from('homes')
      .update({
        electric_utility: value.electricUtility,
        postal_code_fsa: value.postalCodeFsa,
        province: value.province ?? 'NB',
      })
      .eq('id', homeId);
    return error ? 'error' : 'ok';
  }
  const { error } = await supabase.from('homes').insert({
    owner_id: userId,
    electric_utility: value.electricUtility,
    postal_code_fsa: value.postalCodeFsa,
    province: value.province ?? 'NB',
  });
  return error ? 'error' : 'ok';
}

export default function ProfileRoute() {
  const router = useRouter();
  return (
    <ProfileScreen
      offline={supabase === null}
      onSave={async (value, notifyWhenReady) => {
        const result = await persistProfile(value);
        if (result === 'ok' && notifyWhenReady && value.province && supabase) {
          const { data } = await supabase.auth.getSession();
          const email = data.session?.user.email;
          if (email) {
            await supabase.from('coverage_waitlist').insert({
              email,
              province: value.province,
              consent_notify: true,
            });
          }
        }
        if (result === 'ok') {
          router.replace('/(app)/home');
        }
        return result;
      }}
    />
  );
}
