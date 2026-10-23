import assert from 'node:assert/strict';
import { test } from 'node:test';

import { type PlanOutput } from '../ai/plan.ts';

import { parsePaymentEvent, previewStillLimited, rebuildPlanContent } from './unlock.ts';

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

test('rebuildPlanContent writes every plan_item into the unlocked JSON', () => {
  const full = rebuildPlanContent(preview, [
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
      rationaleFr: 'Vieux châssis',
      rationaleEn: 'Old sashes',
      confidence: 'medium',
      rebateRefs: [{ program_id: 'p1', rule_id: 'r1' }],
    },
  ]);
  assert.equal(full.items.length, 2);
  assert.equal(full.items[1]?.measure, 'windows');
  assert.equal(previewStillLimited(preview), true);
  assert.equal(previewStillLimited(full), false);
});

test('parsePaymentEvent keeps only stripe or revenuecat purchases with a catalog code', () => {
  const ok = parsePaymentEvent({
    provider: 'revenuecat',
    eventId: 'evt-1',
    productCode: 'renoroute_plan_standard',
    planId: 'plan-1',
    ownerId: 'owner-1',
    externalId: 'txn-1',
    kind: 'purchase',
  });
  assert.equal(ok?.provider, 'revenuecat');
  assert.equal(
    parsePaymentEvent({
      provider: 'stripe',
      eventId: 'evt-2',
      productCode: 'plan_free',
      planId: 'plan-1',
      ownerId: 'owner-1',
      externalId: 'cs-1',
      kind: 'purchase',
    }),
    null,
  );
});
