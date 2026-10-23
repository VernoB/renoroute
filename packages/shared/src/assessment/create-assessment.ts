import { canGeneratePlan } from '../consent/plan-consent.ts';
import { isIntakeComplete } from '../home/dashboard-state.ts';
import type { HomeInput } from '../home/home-input.ts';
import type { AppLocale } from '../i18n/locale.ts';

export type CreateAssessmentInput = {
  consentAiAt: string | null;
  home: Partial<HomeInput> | null;
  photoCount: number;
  locale: AppLocale;
};

export type CreateAssessmentResult =
  | { ok: true; status: 'draft'; missing: boolean; locale: AppLocale }
  | { ok: false; reason: 'no_consent' };

export function parseCreateAssessment(input: CreateAssessmentInput): CreateAssessmentResult {
  const missing = !isIntakeComplete(input.home) || input.photoCount === 0;
  if (!canGeneratePlan({ consentAiAt: input.consentAiAt })) {
    return { ok: false, reason: 'no_consent' };
  }
  return { ok: true, status: 'draft', missing, locale: input.locale };
}
