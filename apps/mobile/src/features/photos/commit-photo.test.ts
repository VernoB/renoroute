import { PHOTO_MAX_BYTES, jpegHasExif, jpegHasGps, photoStoragePath } from '@renoroute/shared';

import { commitPhoto, photoCommitRow } from './commit-photo';

const cleanJpeg = new Uint8Array([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
  0x00, 0x01, 0x00, 0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0x00, 0xff,
  0xd9,
]);

const gpsJpeg = new Uint8Array([
  0xff, 0xd8, 0xff, 0xe1, 0x00, 0x24, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 0x4d, 0x4d, 0x00, 0x2a,
  0x00, 0x00, 0x00, 0x08, 0x00, 0x01, 0x88, 0x25, 0x00, 0x04, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00,
  0x00, 0x1a, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00,
  0x3f, 0x00, 0x00, 0xff, 0xd9,
]);

const input = {
  ownerId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  homeId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  photoId: '11111111-1111-4111-8111-111111111111',
  category: 'window' as const,
  bytes: cleanJpeg.buffer,
  width: 1024,
  height: 768,
};

describe('commitPhoto', () => {
  it('uses {uid}/{home_id}/{uuid}.jpg', () => {
    const row = photoCommitRow(input);
    expect(row.storage_path).toBe(photoStoragePath(input.ownerId, input.homeId, input.photoId));
    expect(row.category).toBe('window');
  });

  it('uploads EXIF-stripped JPEG bytes and refuses oversized or raw non-JPEG', async () => {
    const bodies: ArrayBuffer[] = [];
    await expect(
      commitPhoto(input, {
        upload: async (_path, body) => {
          bodies.push(body);
          return { error: null };
        },
        insert: async () => ({ error: null }),
      }),
    ).resolves.toBe('ok');
    expect(jpegHasGps(new Uint8Array(bodies[0] ?? new ArrayBuffer(0)))).toBe(false);
    expect(jpegHasExif(new Uint8Array(bodies[0] ?? new ArrayBuffer(0)))).toBe(false);

    await expect(
      commitPhoto(
        { ...input, bytes: new ArrayBuffer(PHOTO_MAX_BYTES + 1) },
        {
          upload: async () => {
            throw new Error('must not upload');
          },
          insert: async () => {
            throw new Error('must not insert');
          },
        },
      ),
    ).resolves.toBe('invalid');

    await expect(
      commitPhoto(
        { ...input, bytes: gpsJpeg.buffer },
        {
          upload: async (_path, body) => {
            expect(jpegHasGps(new Uint8Array(body))).toBe(false);
            expect(jpegHasExif(new Uint8Array(body))).toBe(false);
            return { error: null };
          },
          insert: async () => ({ error: null }),
        },
      ),
    ).resolves.toBe('ok');
  });
});
