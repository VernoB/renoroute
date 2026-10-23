import { PLAN_PRODUCTS } from '../../../packages/shared/src/payments/products.ts';

import {
  createCheckoutSession,
  mockStripeCheckoutClient,
  stripeClientFromEnv,
  type CheckoutStore,
} from './index.ts';

const ownerId = 'owner-1';
const env = {
  CHECKOUT_SUCCESS_URL: 'renoroute://plan/payment-result?status=success',
  CHECKOUT_CANCEL_URL: 'renoroute://plan/payment-result?status=cancel',
};

function store(overrides: Partial<CheckoutStore> = {}): CheckoutStore {
  return {
    async loadPlan() {
      return { id: 'plan-1', ownerId, unlockedAt: null };
    },
    async findSucceededPayment() {
      return null;
    },
    async insertPendingPayment() {
      return { id: 'pay-1' };
    },
    ...overrides,
  };
}

Deno.test('creates a session from the server catalog and ignores the client price', async () => {
  const recorded: Array<{ amountCents: number; productCode: string; provider: 'stripe' }> = [];
  const stripe = mockStripeCheckoutClient({
    id: 'cs_test_1',
    url: 'https://checkout.stripe.test/1',
  });
  const result = await createCheckoutSession(
    { planId: 'plan-1', productCode: 'renoroute_plan_standard', amountCents: 1 },
    ownerId,
    store({
      async insertPendingPayment(row) {
        recorded.push(row);
        return { id: 'pay-1' };
      },
    }),
    stripe,
    env,
  );
  if (result.ok !== true) {
    throw new Error(`expected ok, got ${JSON.stringify(result)}`);
  }
  if (result.sessionId !== 'cs_test_1') {
    throw new Error('session id was not the mock');
  }
  const payment = recorded[0];
  if (!payment || payment.amountCents !== PLAN_PRODUCTS.renoroute_plan_standard.amountCents) {
    throw new Error('client amount was not ignored');
  }
  if (payment.provider !== 'stripe') {
    throw new Error('provider was not stripe');
  }
});

Deno.test('does not create a session when the plan is already unlocked', async () => {
  const result = await createCheckoutSession(
    { planId: 'plan-1', productCode: 'renoroute_plan_standard' },
    ownerId,
    store({
      async loadPlan() {
        return { id: 'plan-1', ownerId, unlockedAt: '2026-10-23T12:00:00.000Z' };
      },
    }),
    mockStripeCheckoutClient(),
    env,
  );
  if (result.ok !== false || result.reason !== 'already_paid') {
    throw new Error(`expected already_paid, got ${JSON.stringify(result)}`);
  }
});

Deno.test('does not create a session when a succeeded payment exists', async () => {
  const result = await createCheckoutSession(
    { planId: 'plan-1', productCode: 'renoroute_plan_premium' },
    ownerId,
    store({
      async findSucceededPayment() {
        return { id: 'pay-ok' };
      },
    }),
    mockStripeCheckoutClient(),
    env,
  );
  if (result.ok !== false || result.reason !== 'already_paid') {
    throw new Error(`expected already_paid, got ${JSON.stringify(result)}`);
  }
});

Deno.test('rejects an unknown product or another owner', async () => {
  const invalid = await createCheckoutSession(
    { planId: 'plan-1', productCode: 'plan_free' },
    ownerId,
    store(),
    mockStripeCheckoutClient(),
    env,
  );
  if (invalid.ok !== false || invalid.reason !== 'invalid') {
    throw new Error('unknown product was accepted');
  }
  const forbidden = await createCheckoutSession(
    { planId: 'plan-1', productCode: 'renoroute_plan_standard' },
    ownerId,
    store({
      async loadPlan() {
        return { id: 'plan-1', ownerId: 'other', unlockedAt: null };
      },
    }),
    mockStripeCheckoutClient(),
    env,
  );
  if (forbidden.ok !== false || forbidden.reason !== 'forbidden') {
    throw new Error('other-owner plan was accepted');
  }
});

Deno.test('placeholder Stripe keys stay on the mock client', async () => {
  const client = stripeClientFromEnv({ STRIPE_SECRET_KEY: 'sk_test_replace_me' });
  const session = await client.createSession({
    planId: 'plan-1',
    ownerId,
    productCode: 'renoroute_plan_standard',
    amountCents: 1,
    successUrl: env.CHECKOUT_SUCCESS_URL,
    cancelUrl: env.CHECKOUT_CANCEL_URL,
  });
  if (!session.url.includes('checkout.stripe.test')) {
    throw new Error('placeholder key called a live Stripe URL');
  }
});
