import type { Database } from '@renoroute/shared/types/database';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

import { createChunkedStorage, supabaseAuthOptions } from '@/lib/auth/session-storage';

const storage = createChunkedStorage({
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
});

export function createMobileSupabase(url: string, anonKey: string): SupabaseClient<Database> {
  return createClient<Database>(url, anonKey, {
    auth: {
      storage,
      ...supabaseAuthOptions,
    },
  });
}

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
const placeholderKey = !anonKey || anonKey.startsWith('replace-');

export const supabase: SupabaseClient<Database> | null =
  url && anonKey && !placeholderKey ? createMobileSupabase(url, anonKey) : null;
