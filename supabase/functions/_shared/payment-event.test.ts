import { type PlanOutput } from '../../../packages/shared/src/ai/plan.ts';

import { applyPaymentEvent, type UnlockStore } from './payment-event.ts';
import { type PaymentEvent } from '../../../packages/shared/src/payments/unlock.ts';

const preview: PlanOutput = {
  schema_version: 1,
  summary: { fr: 'Aperçu', en: 'Preview' },
  items: [
    {
      priority: 1,
      measure: 'air_sealing',
      title: { fr: 'Étanchéiser', en: 'Air seal' },
      rationale: { fr: 'Fuites', en: 'Leaks' },
      rebate_refs: [],
      confidence: 'high',
      contractor_tips: { fr: [], en: [] },
    },
  ],
  caveats: { fr: [], en: [] },
  missing_info: [],
};

function memoryStore(): UnlockStore & {
  applied: string[];
  unlockedAt: string | null;
  contentItems: number;
} {
  const applied: string[] = [];
  const state = { unlockedAt: null as string | null, contentItems: 1 };
  return {
    applied,
    get unlockedAt() {
      return state.unlockedAt;
    },
    get contentItems() {
      return state.contentItems;
    },
    async eventAlreadyApplied(_provider, eventId) {
      return applied.includes(eventId);
    },
    async loadPlan() {
      return {
        id: 'plan-1',
        ownerId: 'owner-1',
        unlockedAt: state.unlockedAt,
        content: preview,
        items: [
          {
            priority: 1,
            measure: 'air_sealing',
            titleFr: 'Étanchéiser',
            titleEn: 'Air seal',
            rationaleFr: 'Fuites',
            rationaleEn: 'Leaks',
            confidence: 'high',
            rebateRefs: [],
          },
          {
            priority: 3,
            measure: 'windows',
            titleFr: 'Fenêtres',
            titleEn: 'Windows',
            rationaleFr: 'Vieux',
            rationaleEn: 'Old',
            confidence: 'medium',
            rebateRefs: [],
          },
        ],
      };
    },
    async upsertPayment(input) {
      applied.push(input.event.eventId);
      return {
        id: 'pay-1',
        planId: input.event.planId,
        ownerId: input.event.ownerId,
        providerEventId: input.event.eventId,
        status: input.status,
      };
    },
    async writeUnlock(input) {
      state.unlockedAt = input.unlockedAt;
      state.contentItems = input.content.items.length;
    },
  };
}

const purchase: PaymentEvent = {
  provider: 'revenuecat',
  eventId: 'evt-1',
  productCode: 'renoroute_plan_standard',
  planId: 'plan-1',
  ownerId: 'owner-1',
  externalId: 'txn-1',
  kind: 'purchase',
};

Deno.test('a purchase unlocks the plan and writes the full content', async () => {
  const store = memoryStore();
  const first = await applyPaymentEvent(purchase, store, '2026-10-23T16:00:00.000Z');
  if (!first.ok || first.replayed || !first.unlocked) {
    throw new Error(`first apply failed: ${JSON.stringify(first)}`);
  }
  if (store.unlockedAt !== '2026-10-23T16:00:00.000Z') {
    throw new Error('unlocked_at was not set');
  }
  if (store.contentItems !== 2) {
    throw new Error('full plan content was not written');
  }
  const replay = await applyPaymentEvent(purchase, store, '2026-10-23T17:00:00.000Z');
  if (!replay.ok || !replay.replayed) {
    throw new Error('replay was not idempotent');
  }
  if (store.unlockedAt !== '2026-10-23T16:00:00.000Z') {
    throw new Error('replay changed unlocked_at');
  }
});

Deno.test('a refund relocks the plan', async () => {
  const store = memoryStore();
  await applyPaymentEvent(purchase, store, '2026-10-23T16:00:00.000Z');
  const refund = await applyPaymentEvent(
    { ...purchase, eventId: 'evt-2', kind: 'refund' },
    store,
    '2026-10-23T18:00:00.000Z',
  );
  if (!refund.ok || refund.unlocked) {
    throw new Error('refund did not relock');
  }
  if (store.unlockedAt !== null) {
    throw new Error('unlocked_at stayed set after refund');
  }
});
