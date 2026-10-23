import { type PlanOutput, planOutputSchema } from '../../../packages/shared/src/ai/plan.ts';
import { type UnlockPlanItem } from '../../../packages/shared/src/payments/unlock.ts';

import { type UnlockStore } from './payment-event.ts';

type LooseQuery = {
  select: (columns: string) => LooseQuery;
  insert: (row: unknown) => LooseQuery;
  update: (row: unknown) => LooseQuery;
  eq: (column: string, value: unknown) => LooseQuery;
  maybeSingle: () => Promise<{ data: Record<string, unknown> | null }>;
  then: Promise<{ data: unknown }>['then'];
};

type LooseClient = {
  from: (table: string) => LooseQuery;
};

export function createUnlockStoreFromClient(service: LooseClient): UnlockStore {
  return {
    async eventAlreadyApplied(provider, eventId) {
      const { data } = await service
        .from('payments')
        .select('id')
        .eq('provider', provider)
        .eq('provider_event_id', eventId)
        .maybeSingle();
      return Boolean(data?.id);
    },
    async loadPlan(planId, ownerId) {
      const { data: plan } = await service
        .from('plans')
        .select('id, owner_id, unlocked_at, content')
        .eq('id', planId)
        .eq('owner_id', ownerId)
        .maybeSingle();
      if (!plan || typeof plan.id !== 'string' || typeof plan.owner_id !== 'string') {
        return null;
      }
      const parsed = planOutputSchema.safeParse(plan.content);
      if (!parsed.success) {
        return null;
      }
      const { data: rows } = await service.from('plan_items').select('*').eq('plan_id', planId);
      const items: UnlockPlanItem[] = Array.isArray(rows)
        ? rows.flatMap((row) => {
            const item = row as Record<string, unknown>;
            if (
              typeof item.priority !== 'number' ||
              typeof item.measure !== 'string' ||
              typeof item.title_fr !== 'string' ||
              typeof item.title_en !== 'string'
            ) {
              return [];
            }
            const rebates = Array.isArray(item.matched_rebates) ? item.matched_rebates : [];
            return [
              {
                priority: item.priority,
                measure: item.measure,
                titleFr: item.title_fr,
                titleEn: item.title_en,
                rationaleFr: typeof item.rationale_fr === 'string' ? item.rationale_fr : item.title_fr,
                rationaleEn: typeof item.rationale_en === 'string' ? item.rationale_en : item.title_en,
                confidence:
                  item.confidence === 'low' || item.confidence === 'medium' || item.confidence === 'high'
                    ? item.confidence
                    : 'low',
                rebateRefs: rebates.flatMap((ref) => {
                  if (!ref || typeof ref !== 'object') {
                    return [];
                  }
                  const typed = ref as { program_id?: unknown; rule_id?: unknown };
                  if (typeof typed.program_id !== 'string' || typeof typed.rule_id !== 'string') {
                    return [];
                  }
                  return [{ program_id: typed.program_id, rule_id: typed.rule_id }];
                }),
              },
            ];
          })
        : [];
      return {
        id: plan.id,
        ownerId: plan.owner_id,
        unlockedAt: typeof plan.unlocked_at === 'string' ? plan.unlocked_at : null,
        content: parsed.data,
        items,
      };
    },
    async upsertPayment(input) {
      const { data: existing } = await service
        .from('payments')
        .select('id, plan_id, owner_id, provider_event_id, status')
        .eq('provider', input.event.provider)
        .eq(
          input.event.provider === 'stripe' ? 'stripe_checkout_session_id' : 'revenuecat_event_id',
          input.event.externalId,
        )
        .maybeSingle();
      const row = {
        owner_id: input.event.ownerId,
        plan_id: input.event.planId,
        product_code:
          typeof input.event.productCode === 'string' ? input.event.productCode : 'plan_49',
        amount_cents: input.amountCents,
        tax_cents: 0,
        currency: 'cad',
        status: input.status,
        provider: input.event.provider,
        provider_event_id: input.event.eventId,
        stripe_checkout_session_id:
          input.event.provider === 'stripe' ? input.event.externalId : null,
        revenuecat_event_id: input.event.provider === 'revenuecat' ? input.event.eventId : null,
      };
      if (existing && typeof existing.id === 'string') {
        await service.from('payments').update(row).eq('id', existing.id);
        return {
          id: existing.id,
          planId: input.event.planId,
          ownerId: input.event.ownerId,
          providerEventId: input.event.eventId,
          status: input.status,
        };
      }
      const { data: inserted } = await service.from('payments').insert(row).select('id').maybeSingle();
      return {
        id: typeof inserted?.id === 'string' ? inserted.id : input.event.eventId,
        planId: input.event.planId,
        ownerId: input.event.ownerId,
        providerEventId: input.event.eventId,
        status: input.status,
      };
    },
    async writeUnlock(input) {
      await service
        .from('plans')
        .update({
          product_code: input.productCode,
          unlocked_at: input.unlockedAt,
          status: input.status,
          content: input.content,
        })
        .eq('id', input.planId);
    },
  };
}

export async function createUnlockStore(): Promise<UnlockStore> {
  const { createClient } = await import('npm:@supabase/supabase-js@2');
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  return createUnlockStoreFromClient(createClient(url, serviceKey) as unknown as LooseClient);
}

export type { PlanOutput };
