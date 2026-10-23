import { PHOTO_CATEGORIES, type PhotoCategory } from '../home/enums.ts';
import { isAllowedPhotoBytes } from './photo-upload.ts';

export type QueuedPhoto = {
  id: string;
  ownerId: string;
  homeId: string;
  category: PhotoCategory;
  localUri: string;
  width: number;
  height: number;
  bytes: number;
};

export function parseQueuedPhoto(value: unknown): QueuedPhoto | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const row = value as Record<string, unknown>;
  const category = row.category;
  if (typeof category !== 'string' || !PHOTO_CATEGORIES.includes(category as PhotoCategory)) {
    return null;
  }
  if (
    typeof row.id !== 'string' ||
    typeof row.ownerId !== 'string' ||
    typeof row.homeId !== 'string' ||
    typeof row.localUri !== 'string' ||
    typeof row.width !== 'number' ||
    typeof row.height !== 'number' ||
    typeof row.bytes !== 'number'
  ) {
    return null;
  }
  if (!isAllowedPhotoBytes(row.bytes) || row.localUri.trim().length === 0) {
    return null;
  }
  return {
    id: row.id,
    ownerId: row.ownerId,
    homeId: row.homeId,
    category: category as PhotoCategory,
    localUri: row.localUri,
    width: row.width,
    height: row.height,
    bytes: row.bytes,
  };
}

export function enqueuePhoto(queue: readonly QueuedPhoto[], item: QueuedPhoto): QueuedPhoto[] {
  if (queue.some((row) => row.id === item.id)) {
    return [...queue];
  }
  return [...queue, item];
}

export function dequeuePhoto(queue: readonly QueuedPhoto[], id: string): QueuedPhoto[] {
  return queue.filter((row) => row.id !== id);
}
