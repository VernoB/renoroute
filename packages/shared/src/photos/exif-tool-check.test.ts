import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { exifDevicePlan, exifToolSawGps } from './exif-tool-check.ts';

test('exifToolSawGps follows ExifTool GPS tags, not our JPEG parser', () => {
  assert.equal(exifToolSawGps({}), false);
  assert.equal(exifToolSawGps({ Make: 'Google' } as never), false);
  assert.equal(exifToolSawGps({ GPSLatitude: 45.273 }), true);
  assert.equal(exifToolSawGps({ GPSLongitude: -66.063 }), true);
  assert.equal(exifToolSawGps({ GPSPosition: '45.273 N, 66.063 W' }), true);
  assert.equal(exifToolSawGps({ GPSLatitudeRef: 'N' }), true);
});

test('the device plan runs only on an online Android emulator or iOS simulator', () => {
  assert.equal(exifDevicePlan({ androidOnline: false, iosOnline: false }), 'skip');
  assert.equal(exifDevicePlan({ androidOnline: true, iosOnline: false }), 'android');
  assert.equal(exifDevicePlan({ androidOnline: false, iosOnline: true }), 'ios');
  assert.equal(exifDevicePlan({ androidOnline: true, iosOnline: true }), 'both');
});

test('the device runner judges GPS with Phil Harvey ExifTool on adb and simctl paths', () => {
  const runner = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../../../../scripts/verify-photo-exif.ts'),
    'utf8',
  );
  assert.match(runner, /-GPSLatitude/);
  assert.match(runner, /sourceforge\.net\/project\/exiftool/);
  assert.match(runner, /exifToolSawGps/);
  assert.match(runner, /prepareUploadJpeg/);
  assert.match(runner, /adb/);
  assert.match(runner, /simctl/);
  assert.doesNotMatch(runner, /jpegHasGps\(/);
});
