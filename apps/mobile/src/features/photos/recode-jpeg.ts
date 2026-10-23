import { PHOTO_MAX_BYTES, prepareUploadJpeg } from '@renoroute/shared';
import { EncodingType, readAsStringAsync, writeAsStringAsync } from 'expo-file-system/legacy';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { PHOTO_MAX_EDGE, PHOTO_RECODE_QUALITY, preparePhoto, resizeAction } from './prepare-photo';

export type RecodedJpeg = {
  uri: string;
  width: number;
  height: number;
  bytes: number;
};

/**
 * Re-encode to JPEG, then drop APP1/APP13/COM so EXIF and GPS are not uploaded.
 */
export async function recodeJpeg(
  uri: string,
  width: number,
  height: number,
  sourceBytes: number,
): Promise<RecodedJpeg | 'too_large' | 'gps' | 'error'> {
  const plan = preparePhoto({ width, height, bytes: sourceBytes });
  if (plan.reject) {
    return 'too_large';
  }
  const context = ImageManipulator.manipulate(uri);
  const resize = resizeAction(width, height, PHOTO_MAX_EDGE);
  if (resize) {
    context.resize(resize);
  }
  const image = await context.renderAsync();
  const saved = await image.saveAsync({
    compress: PHOTO_RECODE_QUALITY,
    format: SaveFormat.JPEG,
  });
  const raw = await readJpegBytes(saved.uri);
  if (!raw) {
    return 'too_large';
  }
  const prepared = prepareUploadJpeg(raw, PHOTO_MAX_BYTES);
  if (!prepared.ok) {
    return prepared.reason === 'too_large' ? 'too_large' : 'gps';
  }
  if (!(await writeJpegBytes(saved.uri, prepared.bytes))) {
    return 'error';
  }
  return {
    uri: saved.uri,
    width: saved.width,
    height: saved.height,
    bytes: prepared.bytes.byteLength,
  };
}

export async function readJpegBytes(uri: string): Promise<ArrayBuffer | null> {
  try {
    const base64 = await readAsStringAsync(uri, { encoding: EncodingType.Base64 });
    return decodeBase64(base64);
  } catch {
    return null;
  }
}

function decodeBase64(value: string): ArrayBuffer {
  const binary = globalThis.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

export async function writeJpegBytes(uri: string, bytes: ArrayBuffer): Promise<boolean> {
  try {
    await writeAsStringAsync(uri, encodeBase64(new Uint8Array(bytes)), {
      encoding: EncodingType.Base64,
    });
    return true;
  } catch {
    return false;
  }
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const value of bytes) {
    binary += String.fromCharCode(value);
  }
  return globalThis.btoa(binary);
}
