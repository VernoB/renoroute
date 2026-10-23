import assert from 'node:assert/strict';
import { test } from 'node:test';

import { hasGpsExif } from './exif.ts';

test('hasGpsExif is false when no GPS tags are present', () => {
  assert.equal(hasGpsExif({}), false);
  assert.equal(hasGpsExif({ Make: 'Apple', DateTimeOriginal: '2026:10:22' }), false);
  assert.equal(hasGpsExif({ GPSLatitude: null, GPSLongitude: '', gps: {} }), false);
});

test('hasGpsExif detects GPSLatitude or GPSLongitude', () => {
  assert.equal(hasGpsExif({ GPSLatitude: 45.27 }), true);
  assert.equal(hasGpsExif({ GPSLongitude: -66.06 }), true);
  assert.equal(hasGpsExif({ GPSLatitude: 0, GPSLongitude: 0 }), true);
  assert.equal(hasGpsExif({ GPSLatitude: [45, 16, 12] }), true);
});

test('hasGpsExif detects a nested gps object', () => {
  assert.equal(hasGpsExif({ gps: { latitude: 45.27, longitude: -66.06 } }), true);
});
