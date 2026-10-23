import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PHOTO_CATEGORIES } from '../home/enums.ts';
import {
  isAllowedPhotoBytes,
  OPTIONAL_PHOTO_CATEGORIES,
  PHOTO_MAX_BYTES,
  photoStoragePath,
  RECOMMENDED_PHOTO_CATEGORIES,
} from './photo-upload.ts';

test('PHOTO_MAX_BYTES is 5 MiB', () => {
  assert.equal(PHOTO_MAX_BYTES, 5 * 1024 * 1024);
});

test('recommended and optional categories cover every photo_category once', () => {
  const listed = [...RECOMMENDED_PHOTO_CATEGORIES, ...OPTIONAL_PHOTO_CATEGORIES];
  assert.deepEqual([...listed].sort(), [...PHOTO_CATEGORIES].sort());
  assert.equal(new Set(listed).size, listed.length);
});

test('photoStoragePath uses {uid}/{home_id}/{uuid}.jpg', () => {
  assert.equal(photoStoragePath('owner-1', 'home-2', 'photo-3'), 'owner-1/home-2/photo-3.jpg');
});

test('isAllowedPhotoBytes accepts a file at the 5 MiB cap', () => {
  assert.equal(isAllowedPhotoBytes(PHOTO_MAX_BYTES), true);
  assert.equal(isAllowedPhotoBytes(1), true);
});

test('isAllowedPhotoBytes rejects empty, negative, or oversized files', () => {
  assert.equal(isAllowedPhotoBytes(0), false);
  assert.equal(isAllowedPhotoBytes(-1), false);
  assert.equal(isAllowedPhotoBytes(PHOTO_MAX_BYTES + 1), false);
  assert.equal(isAllowedPhotoBytes(Number.NaN), false);
});
