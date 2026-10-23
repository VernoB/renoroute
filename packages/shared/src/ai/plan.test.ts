import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  parsePlanOutput,
  previewPlanContent,
  reconcilePlanOutput,
  sanitizePlanText,
  type CandidateMeasure,
  type EligibleRebate,
  type PlanOutput,
} from './plan.ts';

const candidates: CandidateMeasure[] = [
  {
    measure: 'air_sealing',
    cost: { low: 400, high: 1200 },
    annual_savings_cad: { low: 180, high: 432 },
    basis: 'benchmark:NB:air_sealing',
    confidence: 'high',
  },
  {
    measure: 'attic_insulation',
    cost: { low: 2800, high: 5600 },
    annual_savings_cad: { low: 360, high: 720 },
    basis: 'benchmark:NB:attic_insulation',
    confidence: 'high',
  },
  {
    measure: 'windows',
    cost: { low: 8000, high: 14000 },
    annual_savings_cad: { low: 108, high: 288 },
    basis: 'benchmark:NB:windows',
    confidence: 'medium',
  },
];

const rebates: EligibleRebate[] = [
  {
    program_id: 'prog-1',
    rule_id: 'rule-1',
    measure: 'air_sealing',
    program_status: 'open',
    amount: { low: 250, high: 550 },
    requires_pre_evaluation: true,
    last_verified_at: '2026-10-19',
  },
];

function output(overrides: Partial<PlanOutput> = {}): PlanOutput {
  return {
    schema_version: 1,
    summary: { fr: 'Prioriser l’enveloppe.', en: 'Start with the envelope.' },
    items: [
      {
        priority: 1,
        measure: 'air_sealing',
        title: { fr: 'Étanchéiser', en: 'Air seal' },
        rationale: { fr: 'Fuites visibles.', en: 'Visible leaks.' },
        rebate_refs: [{ program_id: 'prog-1', rule_id: 'rule-1' }],
        confidence: 'high',
        contractor_tips: { fr: [], en: [] },
      },
      {
        priority: 2,
        measure: 'attic_insulation',
        title: { fr: 'Isoler le grenier', en: 'Insulate the attic' },
        rationale: { fr: 'Attique peu isolé.', en: 'Thin attic insulation.' },
        rebate_refs: [],
        confidence: 'medium',
        contractor_tips: { fr: [], en: [] },
      },
      {
        priority: 3,
        measure: 'windows',
        title: { fr: 'Fenêtres', en: 'Windows' },
        rationale: { fr: 'Simple vitrage.', en: 'Single pane.' },
        rebate_refs: [],
        confidence: 'medium',
        contractor_tips: { fr: [], en: [] },
      },
    ],
    caveats: { fr: [], en: [] },
    missing_info: [],
    ...overrides,
  };
}

test('previewPlanContent keeps only the top two items', () => {
  const preview = previewPlanContent(output());
  assert.equal(preview.items.length, 2);
  assert.deepEqual(
    preview.items.map((item) => item.measure),
    ['air_sealing', 'attic_insulation'],
  );
});

test('reconcilePlanOutput drops invented measures and rebate refs', () => {
  const raw = output({
    items: [
      ...output().items,
      {
        priority: 4,
        measure: 'other',
        title: { fr: 'Inventé', en: 'Invented' },
        rationale: { fr: 'Pas dans les candidats.', en: 'Not a candidate.' },
        rebate_refs: [{ program_id: 'nope', rule_id: 'nope' }],
        confidence: 'low',
        contractor_tips: { fr: [], en: [] },
      },
    ],
  });
  const reconciled = reconcilePlanOutput(raw, candidates, rebates);
  assert.ok(reconciled);
  assert.equal(
    reconciled.items.some((item) => item.measure === 'other'),
    false,
  );
  const air = reconciled.items.find((item) => item.measure === 'air_sealing');
  assert.deepEqual(air?.rebate_refs, [{ program_id: 'prog-1', rule_id: 'rule-1' }]);
});

test('reconcilePlanOutput forces pre-evaluation first when a program requires it', () => {
  const reconciled = reconcilePlanOutput(output(), candidates, rebates);
  assert.equal(reconciled?.items[0]?.measure, 'pre_evaluation');
  assert.equal(reconciled?.items[0]?.priority, 1);
});

test('sanitizePlanText strips URLs and banned eligibility claims in FR and EN', () => {
  assert.equal(sanitizePlanText('See https://example.com for more'), 'See for more');
  assert.equal(sanitizePlanText('Admissible garanti'), 'Admissible');
  assert.equal(sanitizePlanText('Official rebate guaranteed'), 'rebate');
});

test('parsePlanOutput rejects a missing English title', () => {
  const parsed = parsePlanOutput({
    ...output(),
    summary: { fr: 'Résumé', en: '' },
  });
  assert.equal(parsed.ok, false);
});
