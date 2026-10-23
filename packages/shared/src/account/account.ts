import { z } from 'zod';

import type { AppLocale } from '../i18n/locale.ts';

export const DELETE_CONFIRM_PHRASE = {
  fr: 'SUPPRIMER',
  en: 'DELETE',
} as const satisfies Record<AppLocale, string>;

export function deleteConfirmPhrase(locale: AppLocale): string {
  return DELETE_CONFIRM_PHRASE[locale];
}

export function isDeleteConfirmed(typed: string, locale: AppLocale): boolean {
  return typed.trim() === DELETE_CONFIRM_PHRASE[locale];
}

export function withdrawAiConsent(): { consent_ai_at: null } {
  return { consent_ai_at: null };
}

export function marketingConsentUpdate(accepted: boolean): { consent_marketing: boolean } {
  return { consent_marketing: accepted };
}

export function accountLocaleUpdate(locale: AppLocale): { preferred_locale: AppLocale } {
  return { preferred_locale: locale };
}

const exportPhotoSchema = z.object({
  id: z.string(),
  category: z.string(),
  signedUrl: z.string().url(),
});

const exportPaymentSchema = z.object({
  id: z.string(),
  productCode: z.string(),
  amountCents: z.number(),
  currency: z.string(),
  status: z.string(),
  provider: z.string().nullable(),
});

export const exportPayloadSchema = z
  .object({
    exportedAt: z.string(),
    profile: z.object({
      id: z.string(),
      preferredLocale: z.enum(['fr', 'en']),
      postalCodeFsa: z.string().nullable(),
      consentTermsAt: z.string().nullable(),
      consentAiAt: z.string().nullable(),
      consentMarketing: z.boolean(),
      email: z.string().nullable(),
    }),
    homes: z.array(z.record(z.string(), z.unknown())),
    photos: z.array(exportPhotoSchema),
    assessments: z.array(z.record(z.string(), z.unknown())),
    plans: z.array(z.record(z.string(), z.unknown())),
    payments: z.array(exportPaymentSchema),
  })
  .strict();

export type ExportPayload = z.infer<typeof exportPayloadSchema>;

export function parseExportPayload(
  input: unknown,
): { ok: true; value: ExportPayload } | { ok: false } {
  const parsed = exportPayloadSchema.safeParse(input);
  return parsed.success ? { ok: true, value: parsed.data } : { ok: false };
}

export type OwnedRow = { ownerId: string | null };

export type RemainingUserRows = {
  homes: number;
  photos: number;
  assessments: number;
  plans: number;
  storageObjects: number;
  identifiedPayments: number;
};

export function remainingUserRows(
  snapshot: {
    homes: readonly OwnedRow[];
    photos: readonly OwnedRow[];
    assessments: readonly OwnedRow[];
    plans: readonly OwnedRow[];
    storageObjects: readonly OwnedRow[];
    payments: readonly OwnedRow[];
  },
  userId: string,
): RemainingUserRows {
  const count = (rows: readonly OwnedRow[]) => rows.filter((row) => row.ownerId === userId).length;
  return {
    homes: count(snapshot.homes),
    photos: count(snapshot.photos),
    assessments: count(snapshot.assessments),
    plans: count(snapshot.plans),
    storageObjects: count(snapshot.storageObjects),
    identifiedPayments: count(snapshot.payments),
  };
}

export function isAccountGone(left: RemainingUserRows): boolean {
  return (
    left.homes === 0 &&
    left.photos === 0 &&
    left.assessments === 0 &&
    left.plans === 0 &&
    left.storageObjects === 0 &&
    left.identifiedPayments === 0
  );
}
