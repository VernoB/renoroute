import { handleRevenueCatWebhook, paymentEventFromRevenueCat } from './index.ts';
import { type UnlockStore } from '../_shared/payment-event.ts';
import { type PlanOutput } from '../../../packages/shared/src/ai/plan.ts';

const secret = 'rc_test_auth';
const preview: PlanOutput = {
  schema_version: 1,
  summary: { fr: 'Aperçu', en: 'Preview' },
  items: [],
  caveats: { fr: [], en: [] },
  missing_info: [],
};

function store(applied: string[] = []): UnlockStore {
  return {
    async eventAlreadyApplied(_provider, eventId) {
      return applied.includes(eventId);
    },
    async loadPlan() {
      return {
        id: 'plan-1',
        ownerId: 'owner-1',
        unlockedAt: null,
        content: preview,
        items: [],
      };
    },
    async upsertPayment(input) {
      applied.push(input.event.eventId);
      return {
        id: 'pay-1',
        planId: 'plan-1',
        ownerId: 'owner-1',
        providerEventId: input.event.eventId,
        status: input.status,
      };
    },
    async writeUnlock() {},
  };
}

const purchase = {
  event: {
    id: 'rc_evt_1',
    type: 'INITIAL_PURCHASE',
    app_user_id: 'owner-1',
    product_id: 'plan_49',
    transaction_id: 'txn_1',
    subscriber_attributes: { plan_id: { value: 'plan-1' } },
  },
};

Deno.test('revenuecat-webhook rejects a missing auth header', async () => {
  const result = await handleRevenueCatWebhook(purchase, null, secret, store(), '2026-10-23T16:00:00.000Z');
  if (result.status !== 400) {
    throw new Error(`expected 400, got ${result.status}`);
  }
});

Deno.test('revenuecat-webhook unlocks once and ignores a replay', async () => {
  const applied: string[] = [];
  const first = await handleRevenueCatWebhook(
    purchase,
    `Bearer ${secret}`,
    secret,
    store(applied),
    '2026-10-23T16:00:00.000Z',
  );
  if (!first.ok || first.replayed) {
    throw new Error('first event should unlock');
  }
  const replay = await handleRevenueCatWebhook(
    purchase,
    secret,
    secret,
    store(applied),
    '2026-10-23T17:00:00.000Z',
  );
  if (!replay.ok || !replay.replayed) {
    throw new Error('replay should be idempotent');
  }
});

Deno.test('paymentEventFromRevenueCat maps a refund', () => {
  const event = paymentEventFromRevenueCat({
    event: {
      id: 'rc_ref',
      type: 'REFUND',
      app_user_id: 'owner-1',
      product_id: 'plan_49',
      plan_id: 'plan-1',
      transaction_id: 'txn_2',
    },
  });
  if (event?.kind !== 'refund' || event.provider !== 'revenuecat') {
    throw new Error('refund mapping failed');
  }
});
