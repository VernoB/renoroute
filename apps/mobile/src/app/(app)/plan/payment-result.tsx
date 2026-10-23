import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { PaymentResultScreen, type PaymentResultStatus } from '@/features/payments/payment-result-screen';
import { pollUnlockedAt } from '@/features/payments/unlock-poll';
import { supabase } from '@/lib/supabase';

export default function PaymentResultRoute() {
  const router = useRouter();
  const { planId, status: initial } = useLocalSearchParams<{ planId?: string; status?: string }>();
  const [status, setStatus] = useState<PaymentResultStatus>(
    initial === 'cancel' || initial === 'cancelled'
      ? 'cancelled'
      : initial === 'failed'
        ? 'failed'
        : 'waiting',
  );

  useEffect(() => {
    if (!planId || initial === 'cancel' || initial === 'cancelled' || initial === 'failed') {
      return;
    }
    void pollUnlockedAt(() => loadUnlockedAt(planId), {
      intervalMs: 1000,
      timeoutMs: 30_000,
    }).then((result) => {
      setStatus(result === 'unlocked' ? 'success' : 'failed');
    });
  }, [planId, initial]);

  return (
    <PaymentResultScreen
      onRetry={() => {
        router.replace({
          pathname: '/(app)/plan/[planId]/paywall',
          params: { planId: planId ?? '' },
        });
      }}
      status={status}
    />
  );
}

async function loadUnlockedAt(planId: string): Promise<string | null> {
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from('plans')
    .select('unlocked_at')
    .eq('id', planId)
    .maybeSingle();
  return data && typeof data.unlocked_at === 'string' ? data.unlocked_at : null;
}
