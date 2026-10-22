/** Draft label only. TODO(verify): M1-06 has not published the legal text. */
export const TERMS_VERSION = '2026-10-draft';

export type ConsentSelection = {
  termsAccepted: boolean;
  aiAccepted: boolean;
  marketingAccepted: boolean;
};

export type ConsentProfileUpdate = {
  consent_terms_version: typeof TERMS_VERSION;
  consent_terms_at: string;
  consent_ai_at: string;
  consent_marketing: boolean;
};

function isTimestamp(value: string): boolean {
  return value.trim().length > 0 && Number.isFinite(Date.parse(value));
}

/** A plan can be generated only after an AI-processing consent timestamp is stored. */
export function canGeneratePlan(input: { consentAiAt: string | null }): boolean {
  return input.consentAiAt !== null && isTimestamp(input.consentAiAt);
}

/** Profile columns to write. Null when terms or AI consent is missing. */
export function consentProfileUpdate(
  selection: ConsentSelection,
  acceptedAt: string,
): ConsentProfileUpdate | null {
  if (!selection.termsAccepted || !selection.aiAccepted || !isTimestamp(acceptedAt)) {
    return null;
  }
  return {
    consent_terms_version: TERMS_VERSION,
    consent_terms_at: acceptedAt,
    consent_ai_at: acceptedAt,
    consent_marketing: selection.marketingAccepted,
  };
}
