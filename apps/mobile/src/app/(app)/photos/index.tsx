import { type PhotoCategory } from '@renoroute/shared';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { PhotoChecklist } from '@/features/photos/photo-checklist';
import { retryQueuedPhotos, storePickedPhoto, type PhotoStoreStatus } from '@/features/photos/store-picked-photo';
import { pickFromLibrary } from '@/features/photos/pick-photo';
import { currentUserId, loadFirstHome, loadPhotoCounts } from '@/lib/homes';
import { supabase } from '@/lib/supabase';

export default function PhotosRoute() {
  const { t } = useTranslation();
  const router = useRouter();
  const [counts, setCounts] = useState<Partial<Record<PhotoCategory, number>>>({});
  const [status, setStatus] = useState<PhotoStoreStatus | null>(null);
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
      await retryQueuedPhotos();
    })();
  }, [refresh]);

  return (
    <View className="flex-1 bg-background" testID="app-ready">
      {status ? (
        <Text className="px-4 pt-4 font-inter text-body text-neutral-700">{t(status)}</Text>
      ) : null}
      <PhotoChecklist
        counts={counts}
        onAdd={(category) => {
          void addFromLibrary(category);
        }}
        onTakePhoto={(category) => {
          router.push({ pathname: '/(app)/photos/capture', params: { category } });
        }}
      />
    </View>
  );

  async function addFromLibrary(category: PhotoCategory) {
    if (!homeId || !ownerId || !supabase) {
      setStatus('photos.needHome');
      return;
    }
    const picked = await pickFromLibrary();
    if (picked === 'cancelled') {
      return;
    }
    if (picked === 'denied') {
      setStatus('photos.permissionDenied');
      return;
    }
    setStatus('photos.uploading');
    setStatus(await storePickedPhoto(picked, category, ownerId, homeId));
    await refresh(homeId);
  }
}
