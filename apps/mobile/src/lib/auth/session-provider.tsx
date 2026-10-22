import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';

import { isAppRole, type AppRole } from './route-guard';

type AuthState = {
  ready: boolean;
  hasSession: boolean;
  role: AppRole | null;
};

const signedOut: AuthState = { ready: true, hasSession: false, role: null };

const AuthContext = createContext<AuthState>(signedOut);

async function loadRole(userId: string | null): Promise<AppRole | null> {
  if (!supabase || !userId) {
    return null;
  }
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
  const role = data?.role;
  return isAppRole(role) ? role : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(
    supabase ? { ...signedOut, ready: false } : signedOut,
  );

  useEffect(() => {
    if (!supabase) {
      return;
    }
    let live = true;
    const apply = (session: Session | null) => {
      void loadRole(session?.user.id ?? null).then((role) => {
        if (live) {
          setState({ ready: true, hasSession: session !== null, role });
        }
      });
    };
    void supabase.auth.getSession().then(({ data }) => {
      apply(data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      apply(session);
    });
    return () => {
      live = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => state, [state]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
