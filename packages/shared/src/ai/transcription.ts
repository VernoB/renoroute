import { z } from 'zod';

import { SUPPORTED_LOCALES } from '../i18n/locale.ts';

export const MAX_VOICE_SECONDS = 120;

export const transcribeInputSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALES),
  durationSeconds: z.number().finite().positive().max(MAX_VOICE_SECONDS),
});

export type TranscribeInput = z.infer<typeof transcribeInputSchema>;

export type TranscribeParseResult =
  | { ok: true; value: TranscribeInput }
  | { ok: false; reason: 'too_long' | 'invalid' };

export function parseTranscribeInput(value: unknown): TranscribeParseResult {
  if (isTooLong(value)) {
    return { ok: false, reason: 'too_long' };
  }
  const parsed = transcribeInputSchema.safeParse(value);
  return parsed.success ? { ok: true, value: parsed.data } : { ok: false, reason: 'invalid' };
}

function isTooLong(value: unknown): boolean {
  if (typeof value !== 'object' || value === null || !('durationSeconds' in value)) {
    return false;
  }
  const duration = (value as { durationSeconds?: unknown }).durationSeconds;
  return typeof duration === 'number' && Number.isFinite(duration) && duration > MAX_VOICE_SECONDS;
}
