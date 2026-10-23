import { enqueuePhoto, type QueuedPhoto } from '@renoroute/shared';

import { flushPhotoQueue } from './photo-queue-logic';

const item: QueuedPhoto = {
  id: '11111111-1111-4111-8111-111111111111',
  ownerId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  homeId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  category: 'window',
  localUri: 'file:///tmp/recode.jpg',
  width: 1024,
  height: 768,
  bytes: 120_000,
};

describe('flushPhotoQueue', () => {
  it('drops items that upload and keeps the rest', async () => {
    const keep: QueuedPhoto = { ...item, id: '22222222-2222-4222-8222-222222222222' };
    const remaining = await flushPhotoQueue(enqueuePhoto(enqueuePhoto([], item), keep), async (row) =>
      row.id === item.id ? 'ok' : 'error',
    );
    expect(remaining).toEqual([keep]);
  });

  it('drops a queued file that still has GPS instead of retrying it', async () => {
    const remaining = await flushPhotoQueue([item], async () => 'gps');
    expect(remaining).toEqual([]);
  });
});
