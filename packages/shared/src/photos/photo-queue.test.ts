import assert from 'node:assert/strict';
import { test } from 'node:test';

import { dequeuePhoto, enqueuePhoto, parseQueuedPhoto } from './photo-queue.ts';

const item = {
  id: '11111111-1111-4111-8111-111111111111',
  ownerId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  homeId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  category: 'window' as const,
  localUri: 'file:///tmp/recode.jpg',
  width: 1024,
  height: 768,
  bytes: 120_000,
};

test('parseQueuedPhoto accepts a recoded JPEG waiting to upload', () => {
  assert.deepEqual(parseQueuedPhoto(item), item);
  assert.equal(parseQueuedPhoto({ ...item, category: 'not-a-category' }), null);
  assert.equal(parseQueuedPhoto({ ...item, bytes: 0 }), null);
});

test('the queue keeps one copy and can resume after a drop', () => {
  const once = enqueuePhoto([], item);
  assert.equal(enqueuePhoto(once, item).length, 1);
  assert.equal(dequeuePhoto(once, item.id).length, 0);
});
