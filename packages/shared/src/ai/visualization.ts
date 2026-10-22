import { z } from 'zod';

import { canGeneratePlan } from '../consent/plan-consent.ts';
import { isImagePreviewEnabled, type AiEnv } from './tasks.ts';

const IMAGE_DATA_URL = /^data:image\/(jpeg|jpg|png|webp);base64,/i;
const MAX_IMAGE_DATA_URL_CHARS = 6_000_000;

export const visualizationInputSchema = z.object({
  locale: z.enum(['fr', 'en']),
  imageDataUrl: z
    .string()
    .max(MAX_IMAGE_DATA_URL_CHARS)
    .refine((value) => IMAGE_DATA_URL.test(value), 'unsupported_image'),
  measureHint: z.string().trim().max(80).optional(),
});

export type VisualizationInput = z.infer<typeof visualizationInputSchema>;

export const visualizationResultSchema = z.object({
  schema_version: z.literal(1),
  available: z.boolean(),
  afterImageDataUrl: z.string().nullable(),
  model: z.string().nullable(),
  costUsd: z.number().nonnegative().nullable(),
  reason: z.enum(['ok', 'disabled', 'model_unavailable', 'invalid_image', 'no_consent', 'error']),
});

export type VisualizationResult = z.infer<typeof visualizationResultSchema>;

export function parseVisualizationInput(
  value: unknown,
): { ok: true; value: VisualizationInput } | { ok: false; reason: 'invalid_image' } {
  const parsed = visualizationInputSchema.safeParse(value);
  if (parsed.success) {
    return { ok: true, value: parsed.data };
  }
  return { ok: false, reason: 'invalid_image' };
}

export function shouldAttemptVisualization(input: {
  env: AiEnv;
  consentAiAt: string | null;
}): boolean {
  return isImagePreviewEnabled(input.env) && canGeneratePlan({ consentAiAt: input.consentAiAt });
}

export function unavailableVisualization(
  reason: Exclude<VisualizationResult['reason'], 'ok'>,
): VisualizationResult {
  return {
    schema_version: 1,
    available: false,
    afterImageDataUrl: null,
    model: null,
    costUsd: null,
    reason,
  };
}

export function visualizationPrompt(input: VisualizationInput): string {
  const measure = input.measureHint ?? 'energy efficiency upgrades that are visible';
  return [
    'Create a realistic after photo of the same home from the same camera angle.',
    `Show a finished renovation focused on: ${measure}.`,
    'Keep the house identity. Do not add people, faces, text, logos, or street numbers.',
    'Do not invent official labels or rebate badges. This is an illustration only.',
    `Respond for a ${input.locale === 'fr' ? 'Canadian French' : 'Canadian English'} homeowner.`,
  ].join(' ');
}
