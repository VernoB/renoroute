import { type PlanOutput, PLAN_PREVIEW_ITEM_LIMIT } from '../ai/plan.ts';
import { MEASURE_CODES, type MeasureCode } from '../home/enums.ts';

import { isPaymentProvider, resolvePlanProduct, type PaymentProvider } from './products.ts';

export type UnlockPlanItem = {
  priority: number;
  measure: string;
  titleFr: string;
  titleEn: string;
  rationaleFr: string;
  rationaleEn: string;
  confidence: 'low' | 'medium' | 'high';
  rebateRefs: Array<{ program_id: string; rule_id: string }>;
};

export type PaymentEvent = {
  provider: PaymentProvider;
  eventId: string;
  productCode: unknown;
  planId: string;
  ownerId: string;
  amountCents?: number;
  externalId: string;
  kind: 'purchase' | 'refund';
};

export function rebuildPlanContent(
  preview: PlanOutput,
  items: readonly UnlockPlanItem[],
): PlanOutput {
  const rebuiltItems = [...items]
    .sort((left, right) => left.priority - right.priority)
    .flatMap((item) => {
      if (!(MEASURE_CODES as readonly string[]).includes(item.measure)) {
        return [];
      }
      return [
        {
          priority: item.priority,
          measure: item.measure as MeasureCode,
          title: { fr: item.titleFr, en: item.titleEn },
          rationale: { fr: item.rationaleFr, en: item.rationaleEn },
          rebate_refs: item.rebateRefs,
          confidence: item.confidence,
          contractor_tips: { fr: [] as string[], en: [] as string[] },
        },
      ];
    });
  return { ...preview, items: rebuiltItems };
}

export function previewStillLimited(content: PlanOutput): boolean {
  return content.items.every((item) => item.priority <= PLAN_PREVIEW_ITEM_LIMIT);
}

export function parsePaymentEvent(input: PaymentEvent): PaymentEvent | null {
  if (!isPaymentProvider(input.provider) || input.eventId.length === 0) {
    return null;
  }
  if (input.planId.length === 0 || input.ownerId.length === 0) {
    return null;
  }
  if (input.kind === 'refund') {
    return input;
  }
  return resolvePlanProduct({ productCode: input.productCode }) ? input : null;
}
