import { applyPaymentEvent, verifyRevenueCatAuth, type UnlockStore } from '../_shared/payment-event.ts';
import { type PaymentEvent } from '../../../packages/shared/src/payments/unlock.ts';

export { verifyRevenueCatAuth };

function attributeValue(attributes: unknown, key: string): string {
  if (!attributes || typeof attributes !== 'object') {
    return '';
  }
  const row = (attributes as Record<string, unknown>)[key];
  if (typeof row === 'string') {
    return row;
  }
  if (row && typeof row === 'object' && 'value' in row && typeof row.value === 'string') {
    return row.value;
  }
  return '';
}

export function paymentEventFromRevenueCat(payload: unknown): PaymentEvent | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const root = payload as { event?: Record<string, unknown> };
  const event = root.event;
  if (!event || typeof event.id !== 'string' || typeof event.type !== 'string') {
    return null;
  }
  const ownerId = typeof event.app_user_id === 'string' ? event.app_user_id : '';
  const productCode = typeof event.product_id === 'string' ? event.product_id : '';
  const planId =
    attributeValue(event.subscriber_attributes, 'plan_id') ||
    (typeof event.plan_id === 'string' ? event.plan_id : '');
  const externalId =
    typeof event.transaction_id === 'string' ? event.transaction_id : event.id;
  const purchaseTypes = new Set(['INITIAL_PURCHASE', 'NON_RENEWING_PURCHASE', 'RENEWAL']);
  const refundTypes = new Set(['CANCELLATION', 'REFUND', 'EXPIRATION']);
  if (purchaseTypes.has(event.type)) {
    return {
      provider: 'revenuecat',
      eventId: event.id,
      productCode,
      planId,
      ownerId,
      externalId,
      kind: 'purchase',
    };
  }
  if (refundTypes.has(event.type)) {
    return {
      provider: 'revenuecat',
      eventId: event.id,
      productCode,
      planId,
      ownerId,
      externalId,
      kind: 'refund',
    };
  }
  return null;
}

export async function handleRevenueCatWebhook(
  payload: unknown,
  authHeader: string | null,
  secret: string,
  store: UnlockStore,
  nowIso: string,
): Promise<{ ok: boolean; status: number; replayed?: boolean }> {
  if (!verifyRevenueCatAuth(authHeader, secret)) {
    return { ok: false, status: 400 };
  }
  const event = paymentEventFromRevenueCat(payload);
  if (!event) {
    return { ok: true, status: 200 };
  }
  const result = await applyPaymentEvent(event, store, nowIso);
  if (!result.ok) {
    return { ok: false, status: result.reason === 'forbidden' ? 403 : 400 };
  }
  return { ok: true, status: 200, replayed: result.replayed };
}

export function revenueCatWebhookResponse(result: { ok: boolean; status: number }): Response {
  return Response.json(
    result.ok ? { ok: true } : { ok: false, reason: 'invalid' },
    { status: result.status },
  );
}

if (import.meta.main) {
  const { initFunctionSentry } = await import('../_shared/sentry.ts');
  await initFunctionSentry();
  Deno.serve(async (request) => {
    let payload: unknown = null;
    try {
      payload = await request.json();
    } catch {
      return revenueCatWebhookResponse({ ok: false, status: 400 });
    }
    const result = await handleRevenueCatWebhook(
      payload,
      request.headers.get('Authorization'),
      Deno.env.get('REVENUECAT_WEBHOOK_AUTH') ?? '',
      await liveUnlockStore(),
      new Date().toISOString(),
    );
    return revenueCatWebhookResponse(result);
  });
}

async function liveUnlockStore(): Promise<UnlockStore> {
  const { createUnlockStore } = await import('../_shared/unlock-store.ts');
  return createUnlockStore();
}
