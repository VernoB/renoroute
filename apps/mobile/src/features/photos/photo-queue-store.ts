import AsyncStorage from '@react-native-async-storage/async-storage';
import { enqueuePhoto, parseQueuedPhoto, type QueuedPhoto } from '@renoroute/shared';

const QUEUE_KEY = 'renoroute.photo-queue';

export async function loadPhotoQueue(): Promise<QueuedPhoto[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.flatMap((row) => {
      const item = parseQueuedPhoto(row);
      return item ? [item] : [];
    });
  } catch {
    return [];
  }
}

export async function savePhotoQueue(queue: readonly QueuedPhoto[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function enqueueLocalPhoto(item: QueuedPhoto): Promise<void> {
  const queue = await loadPhotoQueue();
  await savePhotoQueue(enqueuePhoto(queue, item));
}
