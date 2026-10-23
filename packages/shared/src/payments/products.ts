export const PLAN_PRODUCT_CODES = ['plan_49', 'plan_99'] as const;
export type PlanProductCode = (typeof PLAN_PRODUCT_CODES)[number];

export const PAYMENT_PROVIDERS = ['stripe', 'revenuecat'] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export type PlanProduct = {
  code: PlanProductCode;
  amountCents: number;
  currency: 'cad';
  titleKey: 'payments.plan49Title' | 'payments.plan99Title';
};

export const PLAN_PRODUCTS: Record<PlanProductCode, PlanProduct> = {
  plan_49: {
    code: 'plan_49',
    amountCents: 4900,
    currency: 'cad',
    titleKey: 'payments.plan49Title',
  },
  plan_99: {
    code: 'plan_99',
    amountCents: 9900,
    currency: 'cad',
    titleKey: 'payments.plan99Title',
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
