import { type PhotoCategory, type QueuedPhoto } from '@renoroute/shared';

import { supabase } from '@/lib/supabase';

import { commitPhoto } from './commit-photo';
import { flushPhotoQueue } from './photo-queue-logic';
import { enqueueLocalPhoto, loadPhotoQueue, savePhotoQueue } from './photo-queue-store';
import { createPhotoCommitClient, requestPhotoAnalysis } from './photo-upload-client';
import { type PickedPhoto } from './pick-photo';
import { recodeJpeg, readJpegBytes } from './recode-jpeg';

export type PhotoStoreStatus =
  | 'photos.uploading'
  | 'photos.offlineQueued'
  | 'photos.permissionDenied'
  | 'photos.needHome'
  | 'photos.uploadError'
  | 'photos.tooLarge'
  | 'photos.created'
  | 'photos.gpsRefused';

export async function storePickedPhoto(
  picked: PickedPhoto,
  category: PhotoCategory,
  ownerId: string,
  homeId: string,
): Promise<PhotoStoreStatus> {
  const recoded = await recodeJpeg(picked.uri, picked.width, picked.height, picked.bytes);
  if (recoded === 'too_large') {
    return 'photos.tooLarge';
  }
  if (recoded === 'gps') {
    return 'photos.gpsRefused';
  }
  if (recoded === 'error') {
    return 'photos.uploadError';
  }
  const queued: QueuedPhoto = {
    id: crypto.randomUUID(),
    ownerId,
    homeId,
    category,
    localUri: recoded.uri,
    width: recoded.width,
    height: recoded.height,
    bytes: recoded.bytes,
  };
  const uploaded = await uploadQueued(queued);
  if (uploaded === 'ok') {
    return 'photos.created';
  }
  if (uploaded === 'gps') {
    return 'photos.gpsRefused';
  }
  if (uploaded === 'invalid') {
    return 'photos.uploadError';
  }
  if (uploaded === 'too_large') {
    return 'photos.tooLarge';
  }
  await enqueueLocalPhoto(queued);
  return 'photos.offlineQueued';
}

export async function uploadQueued(
  item: QueuedPhoto,
): Promise<'ok' | 'error' | 'gps' | 'invalid' | 'too_large'> {
  if (!supabase) {
    return 'error';
  }
  const bytes = await readJpegBytes(item.localUri);
  if (!bytes) {
    return 'error';
  }
  const result = await commitPhoto(
    {
      ownerId: item.ownerId,
      homeId: item.homeId,
      photoId: item.id,
      category: item.category,
      bytes,
      width: item.width,
      height: item.height,
    },
    createPhotoCommitClient(supabase),
  );
  if (result !== 'ok') {
    return result;
  }
  try {
    await requestPhotoAnalysis(supabase, item.id);
  } catch {
    // Upload already succeeded; vision can be retried later.
  }
  return 'ok';
}

export async function retryQueuedPhotos(): Promise<void> {
  const remaining = await flushPhotoQueue(await loadPhotoQueue(), uploadQueued);
  await savePhotoQueue(remaining);
}
