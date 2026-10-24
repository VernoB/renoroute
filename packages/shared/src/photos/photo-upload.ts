import { PHOTO_CATEGORIES, type PhotoCategory } from '../home/enums.ts';

export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export const RECOMMENDED_PHOTO_CATEGORIES = [
  'window',
  'door',
  'attic',
  'basement',
  'heating_equipment',
  'water_heater',
  'electrical_panel',
  'energy_bill',
] as const satisfies readonly PhotoCategory[];

export const OPTIONAL_PHOTO_CATEGORIES = [
  'exterior',
  'room',
  'other',
] as const satisfies readonly PhotoCategory[];

export type RecommendedPhotoCategory = (typeof RECOMMENDED_PHOTO_CATEGORIES)[number];
export type OptionalPhotoCategory = (typeof OPTIONAL_PHOTO_CATEGORIES)[number];

export function photoStoragePath(ownerId: string, homeId: string, id: string): string {
  return `${ownerId}/${homeId}/${id}.jpg`;
}

export function isAllowedPhotoBytes(bytes: number): boolean {
  return Number.isFinite(bytes) && bytes > 0 && bytes <= PHOTO_MAX_BYTES;
}

export function photoCaptureCategory(value: string | string[] | undefined): PhotoCategory {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw && (PHOTO_CATEGORIES as readonly string[]).includes(raw)) {
    return raw as PhotoCategory;
  }
  return 'window';
}

export function photoTipKey(category: PhotoCategory): `photos.tip.${PhotoCategory}` {
  return `photos.tip.${category}`;
}
