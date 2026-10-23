export type PurchaseProductCode = 'renoroute_plan_standard' | 'renoroute_plan_premium';

export type PurchaseResult =
  | { ok: true }
  | { ok: false; reason: 'cancelled' | 'error' | 'not_configured' };

export type PurchasesClient = {
  purchase: (productCode: PurchaseProductCode) => Promise<PurchaseResult>;
};

/** Sandbox client. The real RevenueCat SDK is wired only when Brown provides a key. */
export function mockPurchasesClient(
  result: PurchaseResult = { ok: false, reason: 'not_configured' },
): PurchasesClient {
  return {
    async purchase() {
      return result;
    },
  };
}

export function purchasesClientFromEnv(
  apiKey: string | undefined,
  live?: PurchasesClient,
): PurchasesClient {
  if (!apiKey || apiKey.includes('replace_me')) {
    return mockPurchasesClient({ ok: false, reason: 'not_configured' });
  }
  return live ?? mockPurchasesClient({ ok: false, reason: 'not_configured' });
}
