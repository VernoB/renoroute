import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PHOTO_CATEGORIES } from '../home/enums.ts';
import {
  isAllowedPhotoBytes,
  OPTIONAL_PHOTO_CATEGORIES,
  PHOTO_MAX_BYTES,
  photoCaptureCategory,
  photoStoragePath,
  photoTipKey,
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

test('photoCaptureCategory keeps a known category and falls back to window', () => {
  assert.equal(photoCaptureCategory('heating_equipment'), 'heating_equipment');
  assert.equal(photoCaptureCategory(['attic']), 'attic');
  assert.equal(photoCaptureCategory('not-a-category'), 'window');
  assert.equal(photoCaptureCategory(undefined), 'window');
});

test('photoTipKey stays inside the photos namespace', () => {
  assert.equal(photoTipKey('window'), 'photos.tip.window');
  assert.equal(photoTipKey('energy_bill'), 'photos.tip.energy_bill');
});

test('isAllowedPhotoBytes rejects empty, negative, or oversized files', () => {
  assert.equal(isAllowedPhotoBytes(0), false);
  assert.equal(isAllowedPhotoBytes(-1), false);
  assert.equal(isAllowedPhotoBytes(PHOTO_MAX_BYTES + 1), false);
  assert.equal(isAllowedPhotoBytes(Number.NaN), false);
});
