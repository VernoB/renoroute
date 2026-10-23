import {
  PHOTO_MAX_BYTES,
  photoStoragePath,
  prepareUploadJpeg,
  type PhotoCategory,
} from '@renoroute/shared';

export type PhotoCommitInput = {
  ownerId: string;
  homeId: string;
  photoId: string;
  category: PhotoCategory;
  bytes: ArrayBuffer;
  width: number;
  height: number;
};

export type PhotoCommitRow = {
  id: string;
  owner_id: string;
  home_id: string;
  category: PhotoCategory;
  storage_path: string;
  bytes: number;
  width: number;
  height: number;
};

export type PhotoCommitClient = {
  upload: (path: string, body: ArrayBuffer) => Promise<{ error: { message: string } | null }>;
  insert: (row: PhotoCommitRow) => Promise<{ error: { message: string } | null }>;
};

export type PhotoCommitResult = 'ok' | 'too_large' | 'error' | 'gps' | 'invalid';

export function photoCommitRow(input: PhotoCommitInput): PhotoCommitRow {
  return {
    id: input.photoId,
    owner_id: input.ownerId,
    home_id: input.homeId,
    category: input.category,
    storage_path: photoStoragePath(input.ownerId, input.homeId, input.photoId),
    bytes: input.bytes.byteLength,
    width: input.width,
    height: input.height,
  };
}

export async function commitPhoto(
  input: PhotoCommitInput,
  client: PhotoCommitClient,
): Promise<PhotoCommitResult> {
  const prepared = prepareUploadJpeg(input.bytes, PHOTO_MAX_BYTES);
  if (!prepared.ok) {
    return prepared.reason;
  }
  const clean = { ...input, bytes: prepared.bytes };
  const row = photoCommitRow(clean);
  const uploaded = await client.upload(row.storage_path, prepared.bytes);
  if (uploaded.error) {
    return 'error';
  }
  const inserted = await client.insert(row);
  return inserted.error ? 'error' : 'ok';
}
