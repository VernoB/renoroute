import { type PhotoCategory, type QueuedPhoto } from '@renoroute/shared';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { commitPhoto } from '@/features/photos/commit-photo';
import { PhotoChecklist } from '@/features/photos/photo-checklist';
import { flushPhotoQueue } from '@/features/photos/photo-queue-logic';
import {
  enqueueLocalPhoto,
  loadPhotoQueue,
  savePhotoQueue,
} from '@/features/photos/photo-queue-store';
import { createPhotoCommitClient, requestPhotoAnalysis } from '@/features/photos/photo-upload-client';
import { pickFromLibrary, takePhoto, type PickedPhoto } from '@/features/photos/pick-photo';
import { recodeJpeg, readJpegBytes } from '@/features/photos/recode-jpeg';
import { currentUserId, loadFirstHome, loadPhotoCounts } from '@/lib/homes';
import { supabase } from '@/lib/supabase';

type StatusKey =
  | 'photos.uploading'
  | 'photos.offlineQueued'
  | 'photos.permissionDenied'
  | 'photos.needHome'
  | 'photos.uploadError'
  | 'photos.tooLarge'
  | 'photos.created'
  | 'photos.gpsRefused'
  | null;

export default function PhotosRoute() {
  const { t } = useTranslation();
  const [counts, setCounts] = useState<Partial<Record<PhotoCategory, number>>>({});
  const [status, setStatus] = useState<StatusKey>(null);
  const [homeId, setHomeId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);

  const refresh = useCallback(async (nextHomeId: string) => {
    setCounts(await loadPhotoCounts(nextHomeId));
  }, []);

  useEffect(() => {
    void (async () => {
      const userId = await currentUserId();
      if (!userId) {
        return;
      }
      setOwnerId(userId);
      const home = await loadFirstHome(userId);
      if (!home) {
        setStatus('photos.needHome');
        return;
      }
      setHomeId(home.row.id);
      await refresh(home.row.id);
      await retryQueued();
    })();
  }, [refresh]);

  return (
    <View className="flex-1 bg-background">
      {status ? (
        <Text className="px-4 pt-4 font-inter text-body text-neutral-700">{t(status)}</Text>
      ) : null}
      <PhotoChecklist
        counts={counts}
        onAdd={(category) => {
          void addPhoto(category, 'library');
        }}
        onTakePhoto={(category) => {
          void addPhoto(category, 'camera');
        }}
      />
    </View>
  );

  async function addPhoto(category: PhotoCategory, source: 'library' | 'camera') {
    if (!homeId || !ownerId || !supabase) {
      setStatus('photos.needHome');
      return;
    }
    const picked = source === 'camera' ? await takePhoto() : await pickFromLibrary();
    if (picked === 'cancelled') {
      return;
    }
    if (picked === 'denied') {
      setStatus('photos.permissionDenied');
      return;
    }
    setStatus('photos.uploading');
    const result = await storePickedPhoto(picked, category, ownerId, homeId);
    setStatus(result);
    await refresh(homeId);
  }
}

async function storePickedPhoto(
  picked: PickedPhoto,
  category: PhotoCategory,
  ownerId: string,
  homeId: string,
): Promise<Exclude<StatusKey, null>> {
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
  const photoId = crypto.randomUUID();
  const queued: QueuedPhoto = {
    id: photoId,
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

async function uploadQueued(
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

async function retryQueued(): Promise<void> {
  const remaining = await flushPhotoQueue(await loadPhotoQueue(), uploadQueued);
  await savePhotoQueue(remaining);
  if (remaining.length > 0) {
    return;
  }
}
