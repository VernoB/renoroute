import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  jpegHasExif,
  jpegHasGps,
  prepareUploadJpeg,
  stripJpegExif,
} from './jpeg-exif.ts';

test('a JPEG without APP1 has no EXIF or GPS', () => {
  const jpeg = buildJpeg();
  assert.equal(jpegHasExif(jpeg), false);
  assert.equal(jpegHasGps(jpeg), false);
  const prepared = prepareUploadJpeg(jpeg, 5 * 1024 * 1024);
  assert.equal(prepared.ok, true);
});

test('an Exif APP1 with a GPS IFD pointer is detected and dropped', () => {
  const dirty = buildJpeg(exifApp1WithGps());
  assert.equal(jpegHasExif(dirty), true);
  assert.equal(jpegHasGps(dirty), true);
  const stripped = stripJpegExif(dirty);
  assert.ok(stripped);
  assert.equal(jpegHasExif(stripped), false);
  assert.equal(jpegHasGps(stripped), false);
  assert.equal(stripped[0], 0xff);
  assert.equal(stripped[1], 0xd8);
  assert.equal(stripped[stripped.length - 2], 0xff);
  assert.equal(stripped[stripped.length - 1], 0xd9);
});

test('XMP GPS keys are treated as GPS and stripped with APP1', () => {
  const dirty = buildJpeg(xmpApp1());
  assert.equal(jpegHasGps(dirty), true);
  const stripped = stripJpegExif(dirty);
  assert.ok(stripped);
  assert.equal(jpegHasGps(stripped), false);
});

test('prepareUploadJpeg refuses a non-JPEG and a GPS block that survived a bad strip', () => {
  assert.equal(prepareUploadJpeg(new Uint8Array([1, 2, 3]), 1024).ok, false);
  const prepared = prepareUploadJpeg(buildJpeg(exifApp1WithGps()), 5 * 1024 * 1024);
  assert.equal(prepared.ok, true);
  if (prepared.ok) {
    assert.equal(jpegHasGps(new Uint8Array(prepared.bytes)), false);
    assert.equal(jpegHasExif(new Uint8Array(prepared.bytes)), false);
  }
});

function buildJpeg(...apps: Uint8Array[]): Uint8Array {
  const parts = [new Uint8Array([0xff, 0xd8]), jfifApp0(), ...apps, sosAndEoi()];
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function jfifApp0(): Uint8Array {
  return new Uint8Array([
    0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01,
    0x00, 0x00,
  ]);
}

function sosAndEoi(): Uint8Array {
  return new Uint8Array([0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0x00, 0xff, 0xd9]);
}

function exifApp1WithGps(): Uint8Array {
  const tiff = new Uint8Array([
    0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08, 0x00, 0x01, 0x88, 0x25, 0x00, 0x04, 0x00, 0x00,
    0x00, 0x01, 0x00, 0x00, 0x00, 0x1a, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);
  const payload = new Uint8Array(6 + tiff.length);
  payload.set([0x45, 0x78, 0x69, 0x66, 0x00, 0x00]);
  payload.set(tiff, 6);
  return app1(payload);
}

function xmpApp1(): Uint8Array {
  const xml =
    'http://ns.adobe.com/xap/1.0/\0<x:xmpmeta><rdf:Description gps:GPSLatitude="45.27" GPSLongitude="-66.06"/></x:xmpmeta>';
  const payload = new Uint8Array(xml.length);
  for (let index = 0; index < xml.length; index += 1) {
    payload[index] = xml.charCodeAt(index);
  }
  return app1(payload);
}

function app1(payload: Uint8Array): Uint8Array {
  const length = payload.length + 2;
  const segment = new Uint8Array(payload.length + 4);
  segment[0] = 0xff;
  segment[1] = 0xe1;
  segment[2] = (length >> 8) & 0xff;
  segment[3] = length & 0xff;
  segment.set(payload, 4);
  return segment;
}
