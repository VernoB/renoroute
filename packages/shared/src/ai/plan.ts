import { z } from 'zod';

import { MEASURE_CODES } from '../home/enums.ts';
import en from '../i18n/en.json' with { type: 'json' };
import fr from '../i18n/fr.json' with { type: 'json' };

export const DISCLAIMER_VERSION = '2026-10-draft';
export const PLAN_PREVIEW_ITEM_LIMIT = 2;

const localized = (max: number) =>
  z.object({
    fr: z.string().trim().min(1).max(max),
    en: z.string().trim().min(1).max(max),
  });

export const planOutputSchema = z.object({
  schema_version: z.literal(1),
  summary: localized(600),
  items: z
    .array(
      z.object({
        priority: z.number().int().min(1).max(50),
        measure: z.enum(MEASURE_CODES),
        title: localized(120),
        rationale: localized(400),
        rebate_refs: z
          .array(
            z.object({
              program_id: z.string().min(1).max(80),
              rule_id: z.string().min(1).max(80),
            }),
          )
          .max(12),
        confidence: z.enum(['low', 'medium', 'high']),
        contractor_tips: z.object({
          fr: z.array(z.string().max(200)).max(6),
          en: z.array(z.string().max(200)).max(6),
        }),
      }),
    )
    .max(20),
  caveats: z.object({
    fr: z.array(z.string().max(240)).max(8),
    en: z.array(z.string().max(240)).max(8),
  }),
  missing_info: z.array(z.string().max(80)).max(20),
});

export type PlanOutput = z.infer<typeof planOutputSchema>;

export type CandidateMeasure = {
  measure: string;
  cost: { low: number; high: number };
  annual_savings_cad: { low: number; high: number } | null;
  basis: string;
  confidence: 'low' | 'medium' | 'high';
};

export type EligibleRebate = {
  program_id: string;
  rule_id: string;
  measure: string;
  program_status: string;
  amount: { low: number | null; high: number | null };
  requires_pre_evaluation: boolean;
  last_verified_at: string;
};

const BANNED =
  /\b(garanti|guaranteed|officiel|official|approuv[ée]s? par NB Power|approved by NB Power)\b/gi;
const URL_RE = /https?:\/\/\S+/gi;
const EMAIL_RE = /\b\S+@\S+\.\S+\b/g;
const PHONE_RE = /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g;

export function sanitizePlanText(value: string): string {
  return value
    .replace(URL_RE, '')
    .replace(EMAIL_RE, '')
    .replace(PHONE_RE, '')
    .replace(BANNED, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitizeLocalized(value: { fr: string; en: string }, max: number) {
  return {
    fr: sanitizePlanText(value.fr).slice(0, max),
    en: sanitizePlanText(value.en).slice(0, max),
  };
}

export function previewPlanContent(output: PlanOutput): PlanOutput {
  const items = [...output.items]
    .sort((left, right) => left.priority - right.priority)
    .filter((item) => item.priority <= PLAN_PREVIEW_ITEM_LIMIT)
    .slice(0, PLAN_PREVIEW_ITEM_LIMIT);
  return { ...output, items };
}

function hasText(value: { fr: string; en: string }): boolean {
  return value.fr.length > 0 && value.en.length > 0;
}

export function reconcilePlanOutput(
  output: PlanOutput,
  candidates: readonly CandidateMeasure[],
  rebates: readonly EligibleRebate[],
): PlanOutput | null {
  const candidateCodes = new Set(candidates.map((row) => row.measure));
  const rebateKeys = new Set(rebates.map((row) => `${row.program_id}:${row.rule_id}`));
  const needsPreEval = rebates.some((row) => row.requires_pre_evaluation);

  const cleanedItems = output.items
    .filter((item) => candidateCodes.has(item.measure) || item.measure === 'pre_evaluation')
    .map((item) => ({
      ...item,
      title: sanitizeLocalized(item.title, 120),
      rationale: sanitizeLocalized(item.rationale, 400),
      contractor_tips: {
        fr: item.contractor_tips.fr.map((tip) => sanitizePlanText(tip)).filter(Boolean),
        en: item.contractor_tips.en.map((tip) => sanitizePlanText(tip)).filter(Boolean),
      },
      rebate_refs: item.rebate_refs.filter((ref) =>
        rebateKeys.has(`${ref.program_id}:${ref.rule_id}`),
      ),
    }))
    .filter((item) => hasText(item.title) && hasText(item.rationale));

  if (needsPreEval && !cleanedItems.some((item) => item.measure === 'pre_evaluation')) {
    cleanedItems.unshift({
      priority: 1,
      measure: 'pre_evaluation',
      title: {
        fr: fr.plan.preEvalTitle,
        en: en.plan.preEvalTitle,
      },
      rationale: {
        fr: fr.plan.preEvalRationale,
        en: en.plan.preEvalRationale,
      },
      rebate_refs: rebates
        .filter((row) => row.requires_pre_evaluation)
        .slice(0, 3)
        .map((row) => ({ program_id: row.program_id, rule_id: row.rule_id })),
      confidence: 'high',
      contractor_tips: { fr: [], en: [] },
    });
  }

  cleanedItems.sort((left, right) => {
    if (needsPreEval && left.measure === 'pre_evaluation') {
      return -1;
    }
    if (needsPreEval && right.measure === 'pre_evaluation') {
      return 1;
    }
    return left.priority - right.priority;
  });

  const items = cleanedItems.map((item, index) => ({ ...item, priority: index + 1 }));
  const summary = sanitizeLocalized(output.summary, 600);
  if (!hasText(summary) || items.length === 0) {
    return null;
  }

  return {
    schema_version: 1,
    summary,
    items,
    caveats: {
      fr: output.caveats.fr.map((row) => sanitizePlanText(row)).filter(Boolean),
      en: output.caveats.en.map((row) => sanitizePlanText(row)).filter(Boolean),
    },
    missing_info: output.missing_info.filter((row) => row.trim().length > 0),
  };
}

export function parsePlanOutput(
  value: unknown,
): { ok: true; value: PlanOutput } | { ok: false; message: string } {
  const parsed = planOutputSchema.safeParse(value);
  if (parsed.success) {
    return { ok: true, value: parsed.data };
  }
  return { ok: false, message: parsed.error.issues[0]?.message ?? 'invalid_plan_output' };
}
