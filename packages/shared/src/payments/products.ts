/** Same ID on Stripe lookup keys, App Store, Play, and RevenueCat. Amounts are not in the ID. */
export const PLAN_PRODUCT_CODES = ['renoroute_plan_standard', 'renoroute_plan_premium'] as const;
export type PlanProductCode = (typeof PLAN_PRODUCT_CODES)[number];

export const DEFAULT_PLAN_PRODUCT_CODE: PlanProductCode = 'renoroute_plan_standard';

export const PAYMENT_PROVIDERS = ['stripe', 'revenuecat'] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export type PlanProduct = {
  code: PlanProductCode;
  amountCents: number;
  currency: 'cad';
  titleKey: 'payments.planStandardTitle' | 'payments.planPremiumTitle';
};

export const PLAN_PRODUCTS: Record<PlanProductCode, PlanProduct> = {
  renoroute_plan_standard: {
    code: 'renoroute_plan_standard',
    amountCents: 4900,
    currency: 'cad',
    titleKey: 'payments.planStandardTitle',
  },
  renoroute_plan_premium: {
    code: 'renoroute_plan_premium',
    amountCents: 9900,
    currency: 'cad',
    titleKey: 'payments.planPremiumTitle',
  },
};

export function isPlanProductCode(value: unknown): value is PlanProductCode {
  return typeof value === 'string' && (PLAN_PRODUCT_CODES as readonly string[]).includes(value);
}

export function isPaymentProvider(value: unknown): value is PaymentProvider {
  return typeof value === 'string' && (PAYMENT_PROVIDERS as readonly string[]).includes(value);
}

/** Server catalog only. A client-sent price is ignored. */
export function resolvePlanProduct(input: {
  productCode: unknown;
  amountCents?: unknown;
}): PlanProduct | null {
  if (!isPlanProductCode(input.productCode)) {
    return null;
  }
  return PLAN_PRODUCTS[input.productCode];
}
