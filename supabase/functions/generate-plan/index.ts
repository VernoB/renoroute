import {
  DISCLAIMER_VERSION,
  planOutputSchema,
  previewPlanContent,
  reconcilePlanOutput,
  type CandidateMeasure,
  type EligibleRebate,
  type PlanOutput,
} from '../../../packages/shared/src/ai/plan.ts';
import { canGeneratePlan } from '../../../packages/shared/src/consent/plan-consent.ts';
import {
  estimateCandidateMeasures,
  type HomeEnergyInput,
  type MeasureBenchmarkRow,
} from '../../../packages/shared/src/calc/cost-savings.ts';
import { type EnergyPriceRow } from '../../../packages/shared/src/calc/energy-prices.ts';
import {
  evaluateEligibility,
  type EligibilityHome,
  type EligibilityProgram,
} from '../../../packages/shared/src/calc/eligibility.ts';
import { generateStructured, type FetchLike } from '../_shared/ai-client.ts';
import { PLAN_PROMPT_VERSION, PLAN_SYSTEM_PROMPT } from '../_shared/prompts/plan_v1.ts';

export const PLAN_DAILY_LIMIT = 8;
export const PLAN_PREVIEW_ITEM_LIMIT = 2;

export type GeneratePlanInput = {
  assessmentId: string;
  ownerId: string;
};

export type GeneratePlanOk = {
  ok: true;
  planId: string;
  reused: boolean;
  content: PlanOutput;
  aiCostUsd: number | null;
};

export type GeneratePlanErr = {
  ok: false;
  reason: 'forbidden' | 'no_consent' | 'disabled' | 'invalid_json' | 'error' | 'rate_limited' | 'unsafe_output';
};

export type GeneratePlanResult = GeneratePlanOk | GeneratePlanErr;

export type ProgramSnapshot = EligibilityProgram & {
  id: string;
  lastVerifiedAt: string;
  preEvaluationFeeCad: number | null;
  rules: Array<{
    id: string;
    measure: string;
    amountMinCad: number | null;
    amountMaxCad: number | null;
    conditions: unknown;
    isActive: boolean;
  }>;
};

export type GeneratePlanSnapshot = {
  assessmentId: string;
  homeId: string;
  ownerId: string;
  locale: 'fr' | 'en';
  home: HomeEnergyInput & EligibilityHome & { yearBuilt: number | null; homeType: string | null; notes: string | null };
  photoFindings: Array<{ code: string; confidence: string }>;
  transcript: string | null;
  benchmarks: MeasureBenchmarkRow[];
  energyPrices: EnergyPriceRow[];
  programs: ProgramSnapshot[];
};

export type SavedPlan = {
  id: string;
  content: PlanOutput;
  aiCostUsd: number | null;
};

export type GeneratePlanStore = {
  loadSnapshot: (assessmentId: string, ownerId: string) => Promise<GeneratePlanSnapshot | null>;
  loadExistingPlan: (assessmentId: string, ownerId: string) => Promise<SavedPlan | null>;
  recentPlanCount?: (ownerId: string) => Promise<number>;
  recordGenerate?: (ownerId: string, assessmentId: string) => Promise<void>;
  savePlan: (payload: {
    snapshot: GeneratePlanSnapshot;
    full: PlanOutput;
    preview: PlanOutput;
    candidates: CandidateMeasure[];
    rebates: EligibleRebate[];
    rebateSnapshot: unknown;
    model: string;
    costUsd: number | null;
  }) => Promise<SavedPlan>;
};

export type GeneratePlanDeps = {
  env: Record<string, string | undefined>;
  consentAiAt: string | null;
  store: GeneratePlanStore;
  fetchImpl?: FetchLike;
};

function wrapUserInput(text: string | null): string {
  const clipped = (text ?? '').trim().slice(0, 2000);
  return `<user_input>${clipped}</user_input>`;
}

export function buildCandidateMeasures(snapshot: GeneratePlanSnapshot): CandidateMeasure[] {
  const estimates = estimateCandidateMeasures(snapshot.home, snapshot.benchmarks, snapshot.energyPrices);
  const candidates: CandidateMeasure[] = estimates.map((row) => ({
    measure: row.measure,
    cost: row.cost,
    annual_savings_cad: row.annualSavingsCad,
    basis: row.basis,
    confidence: row.confidence,
  }));

  const needsPreEval = snapshot.programs.some((program) => program.requiresPreEvaluation);
  if (needsPreEval && !candidates.some((row) => row.measure === 'pre_evaluation')) {
    const fee = snapshot.programs.find((program) => program.preEvaluationFeeCad !== null)?.preEvaluationFeeCad;
    candidates.unshift({
      measure: 'pre_evaluation',
      cost: fee === null || fee === undefined ? { low: 0, high: 0 } : { low: fee, high: fee },
      annual_savings_cad: null,
      basis: 'program:pre_evaluation_fee',
      confidence: fee === null || fee === undefined ? 'low' : 'medium',
    });
  }
  return candidates;
}

export function buildEligibleRebates(snapshot: GeneratePlanSnapshot): EligibleRebate[] {
  const rebates: EligibleRebate[] = [];
  for (const program of snapshot.programs) {
    if (program.status === 'closed') {
      continue;
    }
    for (const rule of program.rules) {
      const result = evaluateEligibility(snapshot.home, program, rule);
      if (result.status !== 'likely' && result.status !== 'possible') {
        continue;
      }
      rebates.push({
        program_id: program.id,
        rule_id: rule.id,
        measure: rule.measure,
        program_status: program.status,
        amount: { low: rule.amountMinCad, high: rule.amountMaxCad },
        requires_pre_evaluation: program.requiresPreEvaluation,
        last_verified_at: program.lastVerifiedAt,
      });
    }
  }
  return rebates;
}

export function buildPlanContext(
  snapshot: GeneratePlanSnapshot,
  candidates: CandidateMeasure[],
  rebates: EligibleRebate[],
) {
  return {
    locale: snapshot.locale,
    home: {
      year_built: snapshot.home.yearBuilt,
      home_type: snapshot.home.homeType,
      floor_area_sqft: snapshot.home.floorAreaSqft,
      heating_primary: snapshot.home.heatingPrimary,
      electric_utility: snapshot.home.electricUtility,
      annual_electricity_kwh: snapshot.home.annualElectricityKwh,
      income_band: snapshot.home.householdIncomeBand,
      province: snapshot.home.province,
    },
    photo_findings: snapshot.photoFindings,
    candidate_measures: candidates,
    eligible_rebates: rebates,
    sequencing_rules: ['pre_evaluation_first_if_required', 'envelope_before_heating_sizing'],
    user_notes: wrapUserInput([snapshot.home.notes, snapshot.transcript].filter(Boolean).join('\n')),
  };
}

export async function generatePlan(
  input: GeneratePlanInput,
  deps: GeneratePlanDeps,
): Promise<GeneratePlanResult> {
  if (!canGeneratePlan({ consentAiAt: deps.consentAiAt })) {
    return { ok: false, reason: 'no_consent' };
  }

  const existing = await deps.store.loadExistingPlan(input.assessmentId, input.ownerId);
  if (existing) {
    return {
      ok: true,
      planId: existing.id,
      reused: true,
      content: previewPlanContent(existing.content),
      aiCostUsd: existing.aiCostUsd,
    };
  }

  const recent = (await deps.store.recentPlanCount?.(input.ownerId)) ?? 0;
  if (recent >= PLAN_DAILY_LIMIT) {
    return { ok: false, reason: 'rate_limited' };
  }

  const snapshot = await deps.store.loadSnapshot(input.assessmentId, input.ownerId);
  if (!snapshot || snapshot.ownerId !== input.ownerId) {
    return { ok: false, reason: 'forbidden' };
  }

  const candidates = buildCandidateMeasures(snapshot);
  const rebates = buildEligibleRebates(snapshot);
  const context = buildPlanContext(snapshot, candidates, rebates);

  const generated = await generateStructured(planOutputSchema, [
    { role: 'system', content: PLAN_SYSTEM_PROMPT },
    { role: 'user', content: JSON.stringify(context) },
  ], {
    task: 'plan_write',
    env: deps.env,
    fetchImpl: deps.fetchImpl,
  });

  if (!generated.ok) {
    return { ok: false, reason: generated.reason === 'disabled' ? 'disabled' : generated.reason === 'invalid_json' ? 'invalid_json' : 'error' };
  }

  const reconciled = reconcilePlanOutput(generated.value, candidates, rebates);
  if (!reconciled) {
    return { ok: false, reason: 'unsafe_output' };
  }

  const preview = previewPlanContent(reconciled);
  const rebateSnapshot = snapshot.programs.map((program) => ({
    program_id: program.id,
    slug: program.slug,
    status: program.status,
    last_verified_at: program.lastVerifiedAt,
    disclaimer_version: DISCLAIMER_VERSION,
    prompt_version: PLAN_PROMPT_VERSION,
  }));

  const saved = await deps.store.savePlan({
    snapshot,
    full: reconciled,
    preview,
    candidates,
    rebates,
    rebateSnapshot,
    model: generated.model,
    costUsd: generated.costUsd,
  });
  await deps.store.recordGenerate?.(input.ownerId, input.assessmentId);

  return {
    ok: true,
    planId: saved.id,
    reused: false,
    content: preview,
    aiCostUsd: generated.costUsd,
  };
}

export type GeneratePlanRequestDeps = GeneratePlanDeps & { ownerId: string };

export async function handleGeneratePlanRequest(
  body: unknown,
  deps: GeneratePlanRequestDeps,
): Promise<GeneratePlanResult> {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, reason: 'error' };
  }
  const row = body as Record<string, unknown>;
  if (typeof row.assessmentId !== 'string') {
    return { ok: false, reason: 'error' };
  }
  return generatePlan({ assessmentId: row.assessmentId, ownerId: deps.ownerId }, deps);
}

export function generatePlanResponse(result: GeneratePlanResult): Response {
  return Response.json(result, { headers: { 'Content-Type': 'application/json' } });
}

if (import.meta.main) {
  const { initFunctionSentry } = await import('../_shared/sentry.ts');
  await initFunctionSentry();
  Deno.serve(async (request) => {
    let body: unknown = null;
    try {
      body = await request.json();
    } catch {
      return generatePlanResponse({ ok: false, reason: 'error' });
    }
    const result = await serveGeneratePlan(request, body);
    return generatePlanResponse(result);
  });
}

async function serveGeneratePlan(request: Request, body: unknown): Promise<GeneratePlanResult> {
  const { createClient } = await import('npm:@supabase/supabase-js@2');
  const { userFromAuthHeader } = await import('../_shared/jwt-user.ts');
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const anon = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const authHeader = request.headers.get('Authorization');
  const userClient = createClient(url, anon, {
    global: { headers: authHeader ? { Authorization: authHeader } : {} },
  });
  const service = createClient(url, serviceKey);
  const user = await userFromAuthHeader(authHeader, async () => {
    const { data } = await userClient.auth.getUser();
    return data.user ? { id: data.user.id } : null;
  });
  if (!user) {
    return { ok: false, reason: 'forbidden' };
  }
  const { data: profile } = await userClient
    .from('profiles')
    .select('consent_ai_at')
    .eq('id', user.id)
    .maybeSingle();
  return handleGeneratePlanRequest(body, {
    env: Deno.env.toObject(),
    ownerId: user.id,
    consentAiAt: typeof profile?.consent_ai_at === 'string' ? profile.consent_ai_at : null,
    store: createGeneratePlanStore(
      userClient as unknown as LooseClient,
      service as unknown as LooseClient,
      user.id,
    ),
  });
}

type LooseQuery = {
  select: (columns: string) => LooseQuery;
  insert: (row: unknown) => LooseQuery;
  update: (row: unknown) => LooseQuery;
  eq: (column: string, value: unknown) => LooseQuery;
  maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error?: { message?: string } | null }>;
  then: Promise<{ data: unknown }>['then'];
};

type LooseClient = {
  from: (table: string) => LooseQuery;
  rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: unknown }>;
};

function createGeneratePlanStore(
  userClient: LooseClient,
  service: LooseClient,
  ownerId: string,
): GeneratePlanStore {
  return {
    async loadExistingPlan(assessmentId, requestOwnerId) {
      if (requestOwnerId !== ownerId) {
        return null;
      }
      const { data } = await service
        .from('plans')
        .select('id, content')
        .eq('assessment_id', assessmentId)
        .eq('owner_id', requestOwnerId)
        .maybeSingle();
      if (!data || typeof data.id !== 'string') {
        return null;
      }
      const { data: assessment } = await service
        .from('assessments')
        .select('ai_cost_usd')
        .eq('id', assessmentId)
        .maybeSingle();
      const parsed = typeof data.content === 'object' && data.content !== null ? data.content : null;
      if (!parsed) {
        return null;
      }
      return {
        id: data.id,
        content: parsed as PlanOutput,
        aiCostUsd: typeof assessment?.ai_cost_usd === 'number' ? assessment.ai_cost_usd : null,
      };
    },
    async loadSnapshot(assessmentId, requestOwnerId) {
      if (requestOwnerId !== ownerId) {
        return null;
      }
      const { data: assessment } = await userClient
        .from('assessments')
        .select('id, home_id, owner_id, locale, transcript')
        .eq('id', assessmentId)
        .eq('owner_id', requestOwnerId)
        .maybeSingle();
      if (!assessment) {
        return null;
      }
      const { data: home } = await userClient
        .from('homes')
        .select('*')
        .eq('id', String(assessment.home_id))
        .eq('owner_id', requestOwnerId)
        .maybeSingle();
      if (!home) {
        return null;
      }
      const { data: photos } = await service.from('home_photos').select('ai_observations').eq('home_id', home.id);
      const { data: benchmarks } = await service.from('measure_benchmarks').select('*').eq('is_active', true);
      const { data: prices } = await service.from('energy_prices').select('*').eq('is_published', true);
      const { data: programs } = await service.from('rebate_programs').select('*, rebate_rules(*)').eq('is_published', true);
      return snapshotFromRows(assessment, home, photos, benchmarks, prices, programs);
    },
    async recentPlanCount(requestOwnerId) {
      const { data } = await service.rpc('recent_action_count', {
        p_actor: requestOwnerId,
        p_action: 'generate-plan',
        p_window: '24 hours',
      });
      return typeof data === 'number' ? data : 0;
    },
    async recordGenerate(requestOwnerId, assessmentId) {
      await service.from('audit_log').insert({
        actor_id: requestOwnerId,
        action: 'generate-plan',
        entity: 'assessments',
        entity_id: assessmentId,
        metadata: {},
      });
    },
    async savePlan(payload) {
      const totals = totalsFromItems(payload.full, payload.candidates);
      const { data: plan, error } = await service.from('plans').insert({
        assessment_id: payload.snapshot.assessmentId,
        home_id: payload.snapshot.homeId,
        owner_id: payload.snapshot.ownerId,
        status: 'preview',
        locale: payload.snapshot.locale,
        summary_fr: payload.full.summary.fr,
        summary_en: payload.full.summary.en,
        total_cost_low_cad: totals.costLow,
        total_cost_high_cad: totals.costHigh,
        annual_savings_low_cad: totals.savingsLow,
        annual_savings_high_cad: totals.savingsHigh,
        content: payload.preview,
        schema_version: 1,
        rebate_snapshot: payload.rebateSnapshot,
        disclaimer_version: DISCLAIMER_VERSION,
      }).select('id').maybeSingle();
      if (error || !plan?.id) {
        throw new Error('plan_insert_failed');
      }
      const items = payload.full.items.map((item) => {
        const candidate = payload.candidates.find((row) => row.measure === item.measure);
        const matched = item.rebate_refs.map((ref) => {
          const rebate = payload.rebates.find((row) => row.program_id === ref.program_id && row.rule_id === ref.rule_id);
          return {
            program_id: ref.program_id,
            rule_id: ref.rule_id,
            amount_min: rebate?.amount.low ?? null,
            amount_max: rebate?.amount.high ?? null,
            status: rebate?.program_status ?? null,
          };
        });
        return {
          plan_id: plan.id,
          owner_id: payload.snapshot.ownerId,
          priority: item.priority,
          measure: item.measure,
          title_fr: item.title.fr,
          title_en: item.title.en,
          rationale_fr: item.rationale.fr,
          rationale_en: item.rationale.en,
          cost_low_cad: candidate?.cost.low ?? null,
          cost_high_cad: candidate?.cost.high ?? null,
          savings_low_cad: candidate?.annual_savings_cad?.low ?? null,
          savings_high_cad: candidate?.annual_savings_cad?.high ?? null,
          matched_rebates: matched,
          confidence: item.confidence,
        };
      });
      if (items.length > 0) {
        await service.from('plan_items').insert(items);
      }
      await service.from('assessments').update({
        status: 'completed',
        input_snapshot: {
          home: payload.snapshot.home,
          photo_findings: payload.snapshot.photoFindings,
        },
        model_info: { provider: 'openrouter', model: payload.model, prompt_version: PLAN_PROMPT_VERSION },
        ai_cost_usd: payload.costUsd,
        completed_at: new Date().toISOString(),
      }).eq('id', payload.snapshot.assessmentId);
      return { id: String(plan.id), content: payload.preview, aiCostUsd: payload.costUsd };
    },
  };
}

function totalsFromItems(full: PlanOutput, candidates: CandidateMeasure[]) {
  return full.items.reduce(
    (acc, item) => {
      const candidate = candidates.find((row) => row.measure === item.measure);
      return {
        costLow: acc.costLow + (candidate?.cost.low ?? 0),
        costHigh: acc.costHigh + (candidate?.cost.high ?? 0),
        savingsLow: acc.savingsLow + (candidate?.annual_savings_cad?.low ?? 0),
        savingsHigh: acc.savingsHigh + (candidate?.annual_savings_cad?.high ?? 0),
      };
    },
    { costLow: 0, costHigh: 0, savingsLow: 0, savingsHigh: 0 },
  );
}

function snapshotFromRows(
  assessment: Record<string, unknown>,
  home: Record<string, unknown>,
  photos: unknown,
  benchmarks: unknown,
  prices: unknown,
  programs: unknown,
): GeneratePlanSnapshot | null {
  if (typeof assessment.id !== 'string' || typeof home.id !== 'string' || typeof assessment.owner_id !== 'string') {
    return null;
  }
  return {
    assessmentId: assessment.id,
    homeId: home.id,
    ownerId: assessment.owner_id,
    locale: assessment.locale === 'en' ? 'en' : 'fr',
    home: {
      province: typeof home.province === 'string' ? home.province : 'NB',
      floorAreaSqft: typeof home.floor_area_sqft === 'number' ? home.floor_area_sqft : null,
      windowCount: null,
      annualElectricityKwh: typeof home.annual_electricity_kwh === 'number' ? home.annual_electricity_kwh : null,
      annualEnergyCostCad: typeof home.annual_energy_cost_cad === 'number' ? home.annual_energy_cost_cad : null,
      electricUtility: typeof home.electric_utility === 'string' ? home.electric_utility as EligibilityHome['electricUtility'] : null,
      householdIncomeBand: typeof home.household_income_band === 'string' ? home.household_income_band as EligibilityHome['householdIncomeBand'] : null,
      heatingPrimary: typeof home.heating_primary === 'string' ? home.heating_primary as EligibilityHome['heatingPrimary'] : null,
      ownerOccupied: typeof home.owner_occupied === 'boolean' ? home.owner_occupied : null,
      energyAdvisorStatus: typeof home.energy_advisor_status === 'string' ? home.energy_advisor_status as EligibilityHome['energyAdvisorStatus'] : 'none',
      yearBuilt: typeof home.year_built === 'number' ? home.year_built : null,
      homeType: typeof home.home_type === 'string' ? home.home_type : null,
      notes: typeof home.notes === 'string' ? home.notes : null,
    },
    photoFindings: photoFindingsFrom(photos),
    transcript: typeof assessment.transcript === 'string' ? assessment.transcript : null,
    benchmarks: Array.isArray(benchmarks) ? benchmarks.map(benchmarkFromRow).filter((row): row is MeasureBenchmarkRow => row !== null) : [],
    energyPrices: Array.isArray(prices) ? prices.map(priceFromRow).filter((row): row is EnergyPriceRow => row !== null) : [],
    programs: Array.isArray(programs) ? programs.map(programFromRow).filter((row): row is ProgramSnapshot => row !== null) : [],
  };
}

function photoFindingsFrom(photos: unknown): Array<{ code: string; confidence: string }> {
  if (!Array.isArray(photos)) {
    return [];
  }
  const findings: Array<{ code: string; confidence: string }> = [];
  for (const photo of photos) {
    const observations = (photo as { ai_observations?: { observations?: Array<{ code?: string; confidence?: string }> } }).ai_observations?.observations;
    if (!observations) {
      continue;
    }
    for (const observation of observations) {
      if (observation.code && observation.confidence) {
        findings.push({ code: observation.code, confidence: observation.confidence });
      }
    }
  }
  return findings;
}

function benchmarkFromRow(row: unknown): MeasureBenchmarkRow | null {
  if (typeof row !== 'object' || row === null) {
    return null;
  }
  const value = row as Record<string, unknown>;
  if (typeof value.measure !== 'string' || typeof value.cost_low_cad !== 'number' || typeof value.cost_high_cad !== 'number') {
    return null;
  }
  return {
    province: typeof value.province === 'string' ? value.province : 'NB',
    measure: value.measure,
    costLowCad: value.cost_low_cad,
    costHighCad: value.cost_high_cad,
    costUnit: typeof value.cost_unit === 'string' ? value.cost_unit : 'project',
    savingsPctLow: typeof value.savings_pct_low === 'number' ? value.savings_pct_low : null,
    savingsPctHigh: typeof value.savings_pct_high === 'number' ? value.savings_pct_high : null,
    isActive: value.is_active !== false,
  };
}

function priceFromRow(row: unknown): EnergyPriceRow | null {
  if (typeof row !== 'object' || row === null) {
    return null;
  }
  const value = row as Record<string, unknown>;
  if (value.fuel !== 'electricity' && value.fuel !== 'heating_oil' && value.fuel !== 'propane' && value.fuel !== 'wood_pellets' && value.fuel !== 'natural_gas') {
    return null;
  }
  return {
    fuel: value.fuel,
    unit: typeof value.unit === 'string' ? value.unit : null,
    priceCad: typeof value.price_cad === 'number' ? value.price_cad : null,
    effectiveFrom: typeof value.effective_from === 'string' ? value.effective_from : null,
    isPublished: value.is_published === true,
  };
}

function programFromRow(row: unknown): ProgramSnapshot | null {
  if (typeof row !== 'object' || row === null) {
    return null;
  }
  const value = row as Record<string, unknown>;
  if (typeof value.id !== 'string' || typeof value.slug !== 'string' || typeof value.status !== 'string') {
    return null;
  }
  const rules = Array.isArray(value.rebate_rules) ? value.rebate_rules : [];
  return {
    id: value.id,
    slug: value.slug,
    status: value.status as ProgramSnapshot['status'],
    requiresPreEvaluation: value.requires_pre_evaluation === true,
    incomeMaxCad: typeof value.income_max_cad === 'number' ? value.income_max_cad : null,
    appliesToUtilities: Array.isArray(value.applies_to_utilities) ? value.applies_to_utilities as ProgramSnapshot['appliesToUtilities'] : null,
    lastVerifiedAt: typeof value.last_verified_at === 'string' ? value.last_verified_at : '1970-01-01',
    preEvaluationFeeCad: typeof value.pre_evaluation_fee_cad === 'number' ? value.pre_evaluation_fee_cad : null,
    rules: rules.flatMap((rule) => {
      if (typeof rule !== 'object' || rule === null) {
        return [];
      }
      const item = rule as Record<string, unknown>;
      if (typeof item.id !== 'string' || typeof item.measure !== 'string') {
        return [];
      }
      return [{
        id: item.id,
        measure: item.measure,
        amountMinCad: typeof item.amount_min_cad === 'number' ? item.amount_min_cad : null,
        amountMaxCad: typeof item.amount_max_cad === 'number' ? item.amount_max_cad : null,
        conditions: item.conditions ?? {},
        isActive: item.is_active !== false,
      }];
    }),
  };
}
