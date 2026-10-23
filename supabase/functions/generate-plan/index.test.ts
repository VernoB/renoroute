import { PLAN_SYSTEM_PROMPT } from '../_shared/prompts/plan_v1.ts';

import {
  PLAN_DAILY_LIMIT,
  buildEligibleRebates,
  generatePlan,
  type GeneratePlanSnapshot,
  type GeneratePlanStore,
  type ProgramSnapshot,
} from './index.ts';
import type { PlanOutput } from '../../../packages/shared/src/ai/plan.ts';

const ownerId = 'owner-1';
const consentAiAt = '2026-10-22T12:00:00.000Z';
const env = { AI_API_KEY: 'replace-me', AI_GENERATION_ENABLED: 'true' };

const planOutput: PlanOutput = {
  schema_version: 1,
  summary: { fr: 'Commencer par l’enveloppe.', en: 'Start with the envelope.' },
  items: [
    {
      priority: 1,
      measure: 'air_sealing',
      title: { fr: 'Étanchéiser', en: 'Air seal' },
      rationale: { fr: 'Fuites d’air.', en: 'Air leaks.' },
      rebate_refs: [{ program_id: 'prog-1', rule_id: 'rule-1' }],
      confidence: 'high',
      contractor_tips: { fr: [], en: [] },
    },
    {
      priority: 2,
      measure: 'attic_insulation',
      title: { fr: 'Isoler le grenier', en: 'Insulate the attic' },
      rationale: { fr: 'Attique mince.', en: 'Thin attic.' },
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
      confidence: 'low',
      contractor_tips: { fr: [], en: [] },
    },
  ],
  caveats: { fr: [], en: [] },
  missing_info: [],
};

const openProgram: ProgramSnapshot = {
  id: 'prog-1',
  slug: 'nbp-total-home-energy-savings',
  status: 'open',
  requiresPreEvaluation: true,
  incomeMaxCad: null,
  appliesToUtilities: null,
  lastVerifiedAt: '2026-10-19',
  preEvaluationFeeCad: 99,
  rules: [
    {
      id: 'rule-1',
      measure: 'air_sealing',
      amountMinCad: 250,
      amountMaxCad: 550,
      conditions: { requires_program_pre_evaluation: true },
      isActive: true,
    },
  ],
};

function snapshot(overrides: Partial<GeneratePlanSnapshot> = {}): GeneratePlanSnapshot {
  return {
    assessmentId: 'assess-1',
    homeId: 'home-1',
    ownerId,
    locale: 'fr',
    home: {
      province: 'NB',
      floorAreaSqft: 1400,
      windowCount: 10,
      annualElectricityKwh: 24000,
      annualEnergyCostCad: 3600,
      electricUtility: 'nb_power',
      householdIncomeBand: 'from_100k_to_150k',
      heatingPrimary: 'electric_baseboard',
      ownerOccupied: true,
      energyAdvisorStatus: 'none',
      yearBuilt: 1978,
      homeType: 'detached',
      notes: null,
    },
    photoFindings: [{ code: 'low_attic_insulation', confidence: 'medium' }],
    transcript: null,
    benchmarks: [
      {
        province: 'NB',
        measure: 'air_sealing',
        costLowCad: 400,
        costHighCad: 1200,
        costUnit: 'project',
        savingsPctLow: 5,
        savingsPctHigh: 12,
        isActive: true,
      },
      {
        province: 'NB',
        measure: 'attic_insulation',
        costLowCad: 2,
        costHighCad: 4,
        costUnit: 'sqft',
        savingsPctLow: 10,
        savingsPctHigh: 20,
        isActive: true,
      },
      {
        province: 'NB',
        measure: 'windows',
        costLowCad: 800,
        costHighCad: 1400,
        costUnit: 'window',
        savingsPctLow: 3,
        savingsPctHigh: 8,
        isActive: true,
      },
    ],
    energyPrices: [],
    programs: [openProgram],
    ...overrides,
  };
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function planReply(content: PlanOutput = planOutput, cost = 0.12): Response {
  return jsonResponse({
    model: 'anthropic/claude-sonnet-4.5',
    usage: { cost },
    choices: [{ message: { content: JSON.stringify(content) } }],
  });
}

function store(overrides: Partial<GeneratePlanStore> = {}): GeneratePlanStore {
  return {
    loadSnapshot: () => Promise.resolve(snapshot()),
    loadExistingPlan: () => Promise.resolve(null),
    recentPlanCount: () => Promise.resolve(0),
    recordGenerate: () => Promise.resolve(),
    savePlan: async (payload) => ({
      id: 'plan-1',
      content: payload.preview,
      aiCostUsd: payload.costUsd,
    }),
    ...overrides,
  };
}

Deno.test('preview content keeps only the top two items and records the AI cost', async () => {
  let savedPreviewCount = 0;
  let savedFullCount = 0;
  const result = await generatePlan(
    { assessmentId: 'assess-1', ownerId },
    {
      env,
      consentAiAt,
      fetchImpl: () => Promise.resolve(planReply()),
      store: store({
        savePlan: async (payload) => {
          savedPreviewCount = payload.preview.items.length;
          savedFullCount = payload.full.items.length;
          return { id: 'plan-1', content: payload.preview, aiCostUsd: payload.costUsd };
        },
      }),
    },
  );
  if (!result.ok || result.reused || result.aiCostUsd !== 0.12) {
    throw new Error('expected a new plan with cost');
  }
  if (result.content.items.length !== 2 || savedPreviewCount !== 2 || savedFullCount < 3) {
    throw new Error(`expected preview 2 / full >= 3, got ${result.content.items.length}/${savedFullCount}`);
  }
  if (result.content.items.some((item) => item.priority > 2)) {
    throw new Error('preview leaked a locked item');
  }
});

Deno.test('re-submit returns the existing plan without calling the model', async () => {
  const result = await generatePlan(
    { assessmentId: 'assess-1', ownerId },
    {
      env,
      consentAiAt,
      fetchImpl: () => {
        throw new Error('AI should not run');
      },
      store: store({
        loadExistingPlan: () =>
          Promise.resolve({
            id: 'plan-existing',
            content: planOutput,
            aiCostUsd: 0.2,
          }),
      }),
    },
  );
  if (!result.ok || !result.reused || result.planId !== 'plan-existing') {
    throw new Error('expected reused plan');
  }
  if (result.content.items.length !== 2) {
    throw new Error('reused preview must still be top 2');
  }
});

Deno.test('refuses a third-party assessment and a missing AI consent', async () => {
  const forbidden = await generatePlan(
    { assessmentId: 'assess-1', ownerId },
    {
      env,
      consentAiAt,
      fetchImpl: () => {
        throw new Error('AI should not run');
      },
      store: store({
        loadSnapshot: () => Promise.resolve(snapshot({ ownerId: 'other-user' })),
      }),
    },
  );
  if (forbidden.ok || forbidden.reason !== 'forbidden') {
    throw new Error('expected forbidden');
  }

  const noConsent = await generatePlan(
    { assessmentId: 'assess-1', ownerId },
    {
      env,
      consentAiAt: null,
      fetchImpl: () => {
        throw new Error('AI should not run');
      },
      store: store(),
    },
  );
  if (noConsent.ok || noConsent.reason !== 'no_consent') {
    throw new Error('expected no_consent');
  }
});

Deno.test('rate-limits repeated generate-plan calls', async () => {
  const result = await generatePlan(
    { assessmentId: 'assess-1', ownerId },
    {
      env,
      consentAiAt,
      fetchImpl: () => {
        throw new Error('AI should not run');
      },
      store: store({
        recentPlanCount: () => Promise.resolve(PLAN_DAILY_LIMIT),
      }),
    },
  );
  if (result.ok || result.reason !== 'rate_limited') {
    throw new Error('expected rate_limited');
  }
});

Deno.test('closed programs never reach eligible rebates', () => {
  const rebates = buildEligibleRebates(
    snapshot({
      programs: [
        {
          ...openProgram,
          id: 'closed-1',
          slug: 'ca-greener-homes-loan',
          status: 'closed',
          requiresPreEvaluation: false,
        },
      ],
    }),
  );
  if (rebates.length !== 0) {
    throw new Error('closed programs must be excluded');
  }
});

Deno.test('the plan prompt is the versioned system prompt', async () => {
  let system = '';
  await generatePlan(
    { assessmentId: 'assess-1', ownerId },
    {
      env,
      consentAiAt,
      fetchImpl: (_url, init) => {
        const payload = JSON.parse(init.body) as { messages: { role: string; content: string }[] };
        system = payload.messages[0]?.content ?? '';
        return Promise.resolve(planReply());
      },
      store: store(),
    },
  );
  if (system !== PLAN_SYSTEM_PROMPT) {
    throw new Error('expected PLAN_SYSTEM_PROMPT');
  }
});
