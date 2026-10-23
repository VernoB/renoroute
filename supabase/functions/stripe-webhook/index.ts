import {
  applyPaymentEvent,
  hmacSha256Hex,
  verifyStripeSignature,
  type UnlockStore,
} from '../_shared/payment-event.ts';
import { type PaymentEvent } from '../../../packages/shared/src/payments/unlock.ts';

export { hmacSha256Hex, verifyStripeSignature };

export function paymentEventFromStripe(payload: unknown): PaymentEvent | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const event = payload as {
    id?: unknown;
    type?: unknown;
    data?: { object?: Record<string, unknown> };
  };
  if (typeof event.id !== 'string') {
    return null;
  }
  const object = event.data?.object ?? {};
  const metadata =
    object.metadata && typeof object.metadata === 'object'
      ? (object.metadata as Record<string, unknown>)
      : {};
  const planId =
    typeof object.client_reference_id === 'string'
      ? object.client_reference_id
      : typeof metadata.plan_id === 'string'
        ? metadata.plan_id
        : '';
  const ownerId = typeof metadata.owner_id === 'string' ? metadata.owner_id : '';
  const productCode = typeof metadata.product_code === 'string' ? metadata.product_code : '';
  const externalId =
    typeof object.id === 'string'
      ? object.id
      : typeof object.payment_intent === 'string'
        ? object.payment_intent
        : event.id;
  if (event.type === 'checkout.session.completed') {
    return {
      provider: 'stripe',
      eventId: event.id,
      productCode,
      planId,
      ownerId,
      externalId,
      kind: 'purchase',
    };
  }
  if (event.type === 'charge.refunded') {
    return {
      provider: 'stripe',
      eventId: event.id,
      productCode: typeof metadata.product_code === 'string' ? metadata.product_code : 'plan_49',
      planId,
      ownerId,
      externalId,
      kind: 'refund',
    };
  }
  return null;
}

export async function handleStripeWebhook(
  payloadText: string,
  signature: string | null,
  secret: string,
  store: UnlockStore,
  nowIso: string,
): Promise<{ ok: boolean; status: number; replayed?: boolean }> {
  const signed = await verifyStripeSignature(payloadText, signature, secret);
  if (!signed) {
    return { ok: false, status: 400 };
  }
  let payload: unknown;
  try {
    payload = JSON.parse(payloadText);
  } catch {
    return { ok: false, status: 400 };
  }
  const event = paymentEventFromStripe(payload);
  if (!event) {
    return { ok: true, status: 200 };
  }
  const result = await applyPaymentEvent(event, store, nowIso);
  if (!result.ok) {
    return { ok: false, status: result.reason === 'forbidden' ? 403 : 400 };
  }
  return { ok: true, status: 200, replayed: result.replayed };
}

export function stripeWebhookResponse(result: { ok: boolean; status: number }): Response {
  return Response.json(
    result.ok ? { ok: true } : { ok: false, reason: 'invalid' },
    { status: result.status },
  );
}

if (import.meta.main) {
  const { initFunctionSentry } = await import('../_shared/sentry.ts');
  await initFunctionSentry();
  Deno.serve(async (request) => {
    const payloadText = await request.text();
    const result = await handleStripeWebhook(
      payloadText,
      request.headers.get('stripe-signature'),
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '',
      await liveUnlockStore(),
      new Date().toISOString(),
    );
    return stripeWebhookResponse(result);
  });
}

async function liveUnlockStore(): Promise<UnlockStore> {
  const { createUnlockStore } = await import('../_shared/unlock-store.ts');
  return createUnlockStore();
}
