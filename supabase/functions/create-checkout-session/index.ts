import { resolvePlanProduct } from '../../../packages/shared/src/payments/products.ts';

export type CheckoutPlan = {
  id: string;
  ownerId: string;
  unlockedAt: string | null;
};

export type CheckoutStore = {
  loadPlan: (planId: string, ownerId: string) => Promise<CheckoutPlan | null>;
  findSucceededPayment: (planId: string) => Promise<{ id: string } | null>;
  insertPendingPayment: (row: {
    ownerId: string;
    planId: string;
    productCode: string;
    amountCents: number;
    provider: 'stripe';
    stripeCheckoutSessionId: string;
  }) => Promise<{ id: string }>;
};

export type StripeCheckoutClient = {
  createSession: (input: {
    planId: string;
    ownerId: string;
    productCode: string;
    amountCents: number;
    successUrl: string;
    cancelUrl: string;
  }) => Promise<{ id: string; url: string }>;
};

export type CreateCheckoutOk = {
  ok: true;
  url: string;
  sessionId: string;
};

export type CreateCheckoutErr = {
  ok: false;
  reason: 'forbidden' | 'already_paid' | 'invalid' | 'error';
};

export type CreateCheckoutResult = CreateCheckoutOk | CreateCheckoutErr;

export type CreateCheckoutEnv = {
  CHECKOUT_SUCCESS_URL?: string;
  CHECKOUT_CANCEL_URL?: string;
  STRIPE_SECRET_KEY?: string;
};

export function mockStripeCheckoutClient(
  session: { id: string; url: string } = {
    id: 'cs_test_mock',
    url: 'https://checkout.stripe.test/mock',
  },
): StripeCheckoutClient {
  return {
    async createSession() {
      return session;
    },
  };
}

export function stripeClientFromEnv(
  env: CreateCheckoutEnv,
  fetchFn: typeof fetch = fetch,
): StripeCheckoutClient {
  const key = env.STRIPE_SECRET_KEY ?? '';
  if (!key || key.includes('replace_me')) {
    return mockStripeCheckoutClient();
  }
  return {
    async createSession(input) {
      const response = await fetchFn('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          mode: 'payment',
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          client_reference_id: input.planId,
          'metadata[owner_id]': input.ownerId,
          'metadata[product_code]': input.productCode,
          'line_items[0][quantity]': '1',
          'line_items[0][price_data][currency]': 'cad',
          'line_items[0][price_data][unit_amount]': String(input.amountCents),
          'line_items[0][price_data][product_data][name]': input.productCode,
        }),
      });
      if (!response.ok) {
        throw new Error('stripe_session_failed');
      }
      const body = (await response.json()) as { id?: string; url?: string };
      if (!body.id || !body.url) {
        throw new Error('stripe_session_invalid');
      }
      return { id: body.id, url: body.url };
    },
  };
}

export async function createCheckoutSession(
  input: { planId: unknown; productCode: unknown; amountCents?: unknown },
  ownerId: string,
  store: CheckoutStore,
  stripe: StripeCheckoutClient,
  env: CreateCheckoutEnv,
): Promise<CreateCheckoutResult> {
  if (typeof input.planId !== 'string' || input.planId.length === 0) {
    return { ok: false, reason: 'invalid' };
  }
  const product = resolvePlanProduct({
    productCode: input.productCode,
    amountCents: input.amountCents,
  });
  if (!product) {
    return { ok: false, reason: 'invalid' };
  }

  const plan = await store.loadPlan(input.planId, ownerId);
  if (!plan || plan.ownerId !== ownerId) {
    return { ok: false, reason: 'forbidden' };
  }
  if (plan.unlockedAt) {
    return { ok: false, reason: 'already_paid' };
  }
  const paid = await store.findSucceededPayment(plan.id);
  if (paid) {
    return { ok: false, reason: 'already_paid' };
  }

  const successUrl = env.CHECKOUT_SUCCESS_URL;
  const cancelUrl = env.CHECKOUT_CANCEL_URL;
  if (!successUrl || !cancelUrl) {
    return { ok: false, reason: 'error' };
  }

  try {
    const session = await stripe.createSession({
      planId: plan.id,
      ownerId,
      productCode: product.code,
      amountCents: product.amountCents,
      successUrl,
      cancelUrl,
    });
    await store.insertPendingPayment({
      ownerId,
      planId: plan.id,
      productCode: product.code,
      amountCents: product.amountCents,
      provider: 'stripe',
      stripeCheckoutSessionId: session.id,
    });
    return { ok: true, url: session.url, sessionId: session.id };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

export function createCheckoutResponse(result: CreateCheckoutResult): Response {
  const status =
    result.ok === true
      ? 200
      : result.reason === 'forbidden'
        ? 401
        : result.reason === 'already_paid'
          ? 409
          : result.reason === 'invalid'
            ? 400
            : 500;
  return Response.json(result, { status });
}

if (import.meta.main) {
  const { initFunctionSentry } = await import('../_shared/sentry.ts');
  await initFunctionSentry();
  Deno.serve(async (request) => {
    let body: unknown = null;
    try {
      body = await request.json();
    } catch {
      return createCheckoutResponse({ ok: false, reason: 'error' });
    }
    return createCheckoutResponse(await serveCreateCheckout(request, body));
  });
}

async function serveCreateCheckout(request: Request, body: unknown): Promise<CreateCheckoutResult> {
  const { createClient } = await import('npm:@supabase/supabase-js@2');
  const { userFromAuthHeader } = await import('../_shared/jwt-user.ts');
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const anon = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const authHeader = request.headers.get('Authorization');
  const userClient = createClient(url, anon, {
    global: { headers: authHeader ? { Authorization: authHeader } : {} },
  });
  const service = createClient(url, serviceKey);
  const user = await userFromAuthHeader(authHeader, async () => {
    const { data } = await userClient.auth.getUser();
    return data.user ? { id: data.user.id } : null;
  });
  if (!user) {
    return { ok: false, reason: 'forbidden' };
  }
  const payload =
    body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  return createCheckoutSession(
    {
      planId: payload.planId,
      productCode: payload.productCode,
      amountCents: payload.amountCents,
    },
    user.id,
    createCheckoutStore(
      userClient as unknown as LooseClient,
      service as unknown as LooseClient,
      user.id,
    ),
    stripeClientFromEnv(Deno.env.toObject()),
    Deno.env.toObject(),
  );
}

type LooseQuery = {
  select: (columns: string) => LooseQuery;
  insert: (row: unknown) => LooseQuery;
  eq: (column: string, value: unknown) => LooseQuery;
  maybeSingle: () => Promise<{ data: Record<string, unknown> | null }>;
};

type LooseClient = {
  from: (table: string) => LooseQuery;
};

function createCheckoutStore(
  userClient: LooseClient,
  service: LooseClient,
  ownerId: string,
): CheckoutStore {
  return {
    async loadPlan(planId, requestOwnerId) {
      if (requestOwnerId !== ownerId) {
        return null;
      }
      const { data } = await userClient
        .from('plans')
        .select('id, owner_id, unlocked_at')
        .eq('id', planId)
        .eq('owner_id', ownerId)
        .maybeSingle();
      if (!data || typeof data.id !== 'string' || typeof data.owner_id !== 'string') {
        return null;
      }
      return {
        id: data.id,
        ownerId: data.owner_id,
        unlockedAt: typeof data.unlocked_at === 'string' ? data.unlocked_at : null,
      };
    },
    async findSucceededPayment(planId) {
      const { data } = await service
        .from('payments')
        .select('id')
        .eq('plan_id', planId)
        .eq('status', 'succeeded')
        .maybeSingle();
      return data && typeof data.id === 'string' ? { id: data.id } : null;
    },
    async insertPendingPayment(row) {
      const { data } = await service
        .from('payments')
        .insert({
          owner_id: row.ownerId,
          plan_id: row.planId,
          product_code: row.productCode,
          amount_cents: row.amountCents,
          tax_cents: 0,
          currency: 'cad',
          status: 'pending',
          provider: row.provider,
          stripe_checkout_session_id: row.stripeCheckoutSessionId,
        })
        .select('id')
        .maybeSingle();
      if (!data || typeof data.id !== 'string') {
        throw new Error('payment_insert_failed');
      }
      return { id: data.id };
    },
  };
}
