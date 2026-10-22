import { supabase } from '@/lib/supabase';

export async function requestEmailCode(email: string): Promise<void> {
  if (!supabase) {
    throw new Error('offline');
  }
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { shouldCreateUser: true },
  });
  if (error) {
    throw new Error('rejected');
  }
}

export async function verifyEmailCode(email: string, code: string): Promise<void> {
  if (!supabase) {
    throw new Error('offline');
  }
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: code.trim(),
    type: 'email',
  });
  if (error) {
    throw new Error('rejected');
  }
}
