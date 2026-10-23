import { dequeuePhoto, type QueuedPhoto } from '@renoroute/shared';

export type FlushPhotoResult = 'ok' | 'error' | 'gps' | 'invalid' | 'too_large';

export async function flushPhotoQueue(
  queue: readonly QueuedPhoto[],
  upload: (item: QueuedPhoto) => Promise<FlushPhotoResult>,
): Promise<QueuedPhoto[]> {
  let remaining = [...queue];
  for (const item of queue) {
    const result = await upload(item);
    if (result !== 'error') {
      remaining = dequeuePhoto(remaining, item.id);
    }
  }
  return remaining;
}
