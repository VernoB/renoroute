export const GENERATING_STEPS = ['photos', 'savings', 'programs', 'write'] as const;
export type GeneratingStep = (typeof GENERATING_STEPS)[number];

export const GENERATING_STEP_KEYS = {
  photos: 'generating.stepPhotos',
  savings: 'generating.stepSavings',
  programs: 'generating.stepPrograms',
  write: 'generating.stepWrite',
} as const satisfies Record<GeneratingStep, string>;

export function stepIndexFromElapsed(elapsedMs: number, intervalMs = 2500): number {
  if (elapsedMs < 0) {
    return 0;
  }
  return Math.min(GENERATING_STEPS.length - 1, Math.floor(elapsedMs / intervalMs));
}

export function generatingErrorKey(reason: string | null): string {
  if (reason === 'rate_limited') {
    return 'generating.rateLimited';
  }
  if (reason === 'no_consent') {
    return 'generating.needConsent';
  }
  if (reason === 'disabled') {
    return 'generating.disabled';
  }
  if (reason === 'offline') {
    return 'generating.offline';
  }
  return 'generating.error';
}

export type GeneratePlanClientResult =
  | { ok: true; planId: string }
  | { ok: false; reason: string };

export function parseGeneratePlanResponse(body: unknown): GeneratePlanClientResult {
  if (!body || typeof body !== 'object') {
    return { ok: false, reason: 'error' };
  }
  const row = body as Record<string, unknown>;
  if (row.ok === true && typeof row.planId === 'string' && row.planId.length > 0) {
    return { ok: true, planId: row.planId };
  }
  return { ok: false, reason: typeof row.reason === 'string' ? row.reason : 'error' };
}
