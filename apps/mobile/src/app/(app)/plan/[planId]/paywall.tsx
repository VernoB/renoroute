import { type PlanProductCode } from '@renoroute/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform } from 'react-native';

import { PaywallScreen } from '@/features/payments/paywall-screen';
import { purchasesClientFromEnv } from '@/features/payments/purchases-client';
import { supabase } from '@/lib/supabase';

export default function PaywallRoute() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const [busy, setBusy] = useState(false);
  const [messageKey, setMessageKey] = useState<string | null>(null);
  const channel = Platform.OS === 'web' ? 'web' : 'iap';

  return (
    <PaywallScreen
      busy={busy}
      channel={channel}
      messageKey={messageKey}
      onPay={(code) => {
        void startPayment(channel, planId, code).then((result) => {
          setBusy(false);
          if (result === 'started') {
            router.push({
              pathname: '/(app)/plan/payment-result',
              params: { planId: planId ?? '', status: 'waiting' },
            });
            return;
          }
          setMessageKey(
            result === 'cancelled'
              ? 'payments.cancelled'
              : result === 'not_configured'
                ? 'payments.sandboxOnly'
                : 'payments.failed',
          );
        });
        setBusy(true);
      }}
    />
  );
}

async function startPayment(
  channel: 'iap' | 'web',
  planId: string | undefined,
  productCode: PlanProductCode,
): Promise<'started' | 'cancelled' | 'not_configured' | 'error'> {
  if (!planId) {
    return 'error';
  }
  if (channel === 'iap') {
    const client = purchasesClientFromEnv(process.env.EXPO_PUBLIC_REVENUECAT_API_KEY);
    const result = await client.purchase(productCode);
    if (result.ok) {
      return 'started';
    }
    return result.reason === 'cancelled' || result.reason === 'not_configured'
      ? result.reason
      : 'error';
  }
  if (!supabase) {
    return 'not_configured';
  }
  const { data } = await supabase.functions.invoke('create-checkout-session', {
    body: { planId, productCode, amountCents: 1 },
  });
  if (data && typeof data === 'object' && 'ok' in data && data.ok === true && 'url' in data) {
    return 'started';
  }
  return 'error';
}
