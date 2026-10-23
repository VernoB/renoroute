export const PHOTO_MAX_EDGE = 2048;
export const PHOTO_RECODE_QUALITY = 0.7;
const PHOTO_REJECT_BYTES = 5 * 1024 * 1024;

export type PhotoPrepareInput = {
  width: number;
  height: number;
  bytes: number;
};

export type PhotoPrepareResult = {
  maxEdge: number;
  quality: number;
  reject: boolean;
};

/**
 * Contract for expo-image-manipulator JPEG re-encode (max edge + quality).
 * EXIF/GPS are removed afterwards by stripJpegExif on the JPEG bytes.
 */
export function preparePhoto(input: PhotoPrepareInput): PhotoPrepareResult {
  return {
    maxEdge: PHOTO_MAX_EDGE,
    quality: PHOTO_RECODE_QUALITY,
    reject: input.bytes > PHOTO_REJECT_BYTES,
  };
}

export function resizeAction(
  width: number,
  height: number,
  maxEdge: number,
): { width: number } | { height: number } | null {
  if (width <= maxEdge && height <= maxEdge) {
    return null;
  }
  return width >= height ? { width: maxEdge } : { height: maxEdge };
}
