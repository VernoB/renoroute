import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { photoCaptureCategory } from '@/features/photos/photo-capture';
import { PhotoCaptureScreen } from '@/features/photos/photo-capture-screen';
import { takePhoto, type PickedPhoto } from '@/features/photos/pick-photo';
import { retryQueuedPhotos, storePickedPhoto, type PhotoStoreStatus } from '@/features/photos/store-picked-photo';
import { currentUserId, loadFirstHome } from '@/lib/homes';
import { supabase } from '@/lib/supabase';

export default function PhotoCaptureRoute() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const category = photoCaptureCategory(params.category);
  const [preview, setPreview] = useState<PickedPhoto | null>(null);
  const [status, setStatus] = useState<PhotoStoreStatus | null>(null);
  const [homeId, setHomeId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);

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
      await retryQueuedPhotos();
    })();
  }, []);

  return (
    <View className="flex-1 bg-background" testID="app-ready">
      {status ? (
        <Text className="px-4 pt-4 font-inter text-body text-neutral-700">{t(status)}</Text>
      ) : null}
      <PhotoCaptureScreen
        category={category}
        onRetake={() => {
          setPreview(null);
        }}
        onShutter={() => {
          void capture();
        }}
        onUse={() => {
          void useShot();
        }}
        previewUri={preview?.uri ?? null}
        queued={status === 'photos.offlineQueued'}
      />
    </View>
  );

  async function capture() {
    const picked = await takePhoto();
    if (picked === 'cancelled') {
      return;
    }
    if (picked === 'denied') {
      setStatus('photos.permissionDenied');
      return;
    }
    setPreview(picked);
  }

  async function useShot() {
    if (!preview || !homeId || !ownerId || !supabase) {
      setStatus('photos.needHome');
      return;
    }
    setStatus('photos.uploading');
    const result = await storePickedPhoto(preview, category, ownerId, homeId);
    setStatus(result);
    if (result === 'photos.created' || result === 'photos.offlineQueued') {
      router.replace('/(app)/photos');
    }
  }
}
