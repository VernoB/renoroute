import { handleStripeWebhook, hmacSha256Hex, paymentEventFromStripe } from './index.ts';
import { type UnlockStore } from '../_shared/payment-event.ts';
import { type PlanOutput } from '../../../packages/shared/src/ai/plan.ts';

const secret = 'whsec_test';
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

async function signed(payload: string): Promise<string> {
  const timestamp = '1710000000';
  const signature = await hmacSha256Hex(secret, `${timestamp}.${payload}`);
  return `t=${timestamp},v1=${signature}`;
}

const completed = {
  id: 'evt_stripe_1',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_1',
      client_reference_id: 'plan-1',
      metadata: { owner_id: 'owner-1', product_code: 'plan_49' },
    },
  },
};

Deno.test('stripe-webhook rejects a missing signature', async () => {
  const result = await handleStripeWebhook(JSON.stringify(completed), null, secret, store(), '2026-10-23T16:00:00.000Z');
  if (result.status !== 400) {
    throw new Error(`expected 400, got ${result.status}`);
  }
});

Deno.test('stripe-webhook unlocks once and ignores a replay', async () => {
  const payload = JSON.stringify(completed);
  const header = await signed(payload);
  const applied: string[] = [];
  const first = await handleStripeWebhook(payload, header, secret, store(applied), '2026-10-23T16:00:00.000Z');
  if (!first.ok || first.replayed) {
    throw new Error('first event should unlock');
  }
  const replay = await handleStripeWebhook(payload, header, secret, store(applied), '2026-10-23T17:00:00.000Z');
  if (!replay.ok || !replay.replayed) {
    throw new Error('replay should be idempotent');
  }
});

Deno.test('paymentEventFromStripe maps a refund', () => {
  const event = paymentEventFromStripe({
    id: 'evt_ref',
    type: 'charge.refunded',
    data: {
      object: {
        id: 'ch_1',
        client_reference_id: 'plan-1',
        metadata: { owner_id: 'owner-1', product_code: 'plan_99' },
      },
    },
  });
  if (event?.kind !== 'refund' || event.provider !== 'stripe') {
    throw new Error('refund mapping failed');
  }
});
