import { z } from 'zod';

export const PHOTO_OBSERVATION_CODES = [
  'window_condensation',
  'single_pane_glazing',
  'low_attic_insulation',
  'visible_air_leak',
  'old_oil_tank',
  'baseboard_heaters',
  'mini_split_present',
] as const;

export const photoObservationSchema = z.object({
  schema_version: z.literal(1),
  category_confirmed: z.string().min(1).max(40),
  observations: z
    .array(
      z.object({
        code: z.enum(PHOTO_OBSERVATION_CODES),
        confidence: z.enum(['low', 'medium', 'high']),
        note_fr: z.string().max(200),
        note_en: z.string().max(200),
      }),
    )
    .max(12),
  equipment: z
    .object({
      type: z.string().max(40).nullable(),
      brand_visible: z.boolean(),
      estimated_age_years: z
        .object({
          low: z.number().int().min(0).max(80),
          high: z.number().int().min(0).max(80),
        })
        .nullable(),
    })
    .nullable(),
  quality: z.object({
    usable: z.boolean(),
    issue: z.enum(['blurry', 'too_dark', 'wrong_subject']).nullable(),
  }),
  pii_detected: z.boolean(),
});

export type PhotoObservation = z.infer<typeof photoObservationSchema>;

export function parsePhotoObservation(
  value: unknown,
): { ok: true; value: PhotoObservation } | { ok: false; message: string } {
  const parsed = photoObservationSchema.safeParse(value);
  if (parsed.success) {
    return { ok: true, value: parsed.data };
  }
  const issue = parsed.error.issues[0];
  return { ok: false, message: issue?.message ?? 'invalid_photo_observation' };
}
