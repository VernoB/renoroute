const SOI = 0xd8;
const EOI = 0xd9;
const SOS = 0xda;
const APP1 = 0xe1;
const APP13 = 0xed;
const COM = 0xfe;
const GPS_IFD_TAG = 0x8825;

const EXIF_HEADER = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00] as const;
const XMP_GPS = /GPSLatitude|GPSLongitude|gps:GPS/i;

export type JpegSegment = {
  marker: number;
  start: number;
  end: number;
};

export type PrepareUploadJpeg =
  | { ok: true; bytes: ArrayBuffer; stripped: true }
  | { ok: false; reason: 'invalid' | 'gps' | 'too_large' };

export function isJpeg(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === SOI;
}

/** True when an APP1 Exif block points at a GPS IFD or XMP carries GPS keys. */
export function jpegHasGps(bytes: Uint8Array): boolean {
  const segments = readJpegSegments(bytes);
  if (!segments) {
    return false;
  }
  return segments.some((segment) => segmentHasGps(bytes, segment));
}

export function jpegHasExif(bytes: Uint8Array): boolean {
  const segments = readJpegSegments(bytes);
  if (!segments) {
    return false;
  }
  return segments.some((segment) => {
    if (segment.marker !== APP1) {
      return false;
    }
    return startsWith(payloadOf(bytes, segment), EXIF_HEADER);
  });
}

/** Drops APP1 (Exif/XMP), APP13 (IPTC), and COM. Pixel data is unchanged. */
export function stripJpegExif(bytes: Uint8Array): Uint8Array | null {
  const segments = readJpegSegments(bytes);
  if (!segments) {
    return null;
  }
  const kept = segments.filter((segment) => !isMetadataMarker(segment.marker));
  const length = kept.reduce((sum, segment) => sum + (segment.end - segment.start), 0);
  const out = new Uint8Array(length);
  let offset = 0;
  for (const segment of kept) {
    out.set(bytes.subarray(segment.start, segment.end), offset);
    offset += segment.end - segment.start;
  }
  return out;
}

export function prepareUploadJpeg(input: ArrayBuffer | Uint8Array, maxBytes: number): PrepareUploadJpeg {
  const source = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (!isJpeg(source)) {
    return { ok: false, reason: 'invalid' };
  }
  const stripped = stripJpegExif(source);
  if (!stripped) {
    return { ok: false, reason: 'invalid' };
  }
  if (jpegHasGps(stripped) || jpegHasExif(stripped)) {
    return { ok: false, reason: 'gps' };
  }
  if (!Number.isFinite(maxBytes) || stripped.byteLength <= 0 || stripped.byteLength > maxBytes) {
    return { ok: false, reason: 'too_large' };
  }
  return { ok: true, bytes: copyBuffer(stripped), stripped: true };
}

export function jpegBytesFromDataUrl(dataUrl: string): Uint8Array | null {
  const match = /^data:image\/jpeg;base64,([\s\S]+)$/i.exec(dataUrl);
  const encoded = match?.[1];
  if (!encoded) {
    return null;
  }
  try {
    const binary = globalThis.atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  } catch {
    return null;
  }
}

export function readJpegSegments(bytes: Uint8Array): JpegSegment[] | null {
  if (!isJpeg(bytes)) {
    return null;
  }
  const segments: JpegSegment[] = [{ marker: SOI, start: 0, end: 2 }];
  let offset = 2;
  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) {
      return null;
    }
    let fill = offset;
    while (fill < bytes.length && bytes[fill] === 0xff) {
      fill += 1;
    }
    if (fill >= bytes.length) {
      return null;
    }
    const marker = bytes[fill] ?? 0;
    const start = fill - 1;
    offset = fill + 1;
    if (marker === EOI) {
      segments.push({ marker, start, end: offset });
      return segments;
    }
    if (offset + 1 >= bytes.length) {
      return null;
    }
    const length = ((bytes[offset] ?? 0) << 8) | (bytes[offset + 1] ?? 0);
    if (length < 2 || offset + length > bytes.length) {
      return null;
    }
    const headerEnd = offset + length;
    segments.push({ marker, start, end: headerEnd });
    offset = headerEnd;
    if (marker === SOS) {
      const entropy = scanEntropy(bytes, offset);
      if (!entropy) {
        return null;
      }
      if (entropy.end > offset) {
        segments.push({ marker: 0, start: offset, end: entropy.end });
      }
      segments.push({ marker: EOI, start: entropy.end, end: entropy.end + 2 });
      return segments;
    }
  }
  return null;
}

function scanEntropy(bytes: Uint8Array, start: number): { end: number } | null {
  let offset = start;
  while (offset + 1 < bytes.length) {
    if (bytes[offset] === 0xff) {
      const next = bytes[offset + 1] ?? 0;
      if (next === 0x00 || (next >= 0xd0 && next <= 0xd7)) {
        offset += 2;
        continue;
      }
      if (next === EOI) {
        return { end: offset };
      }
      return null;
    }
    offset += 1;
  }
  return null;
}

function isMetadataMarker(marker: number): boolean {
  return marker === APP1 || marker === APP13 || marker === COM;
}

function segmentHasGps(bytes: Uint8Array, segment: JpegSegment): boolean {
  if (segment.marker !== APP1) {
    return false;
  }
  const payload = payloadOf(bytes, segment);
  if (startsWith(payload, EXIF_HEADER)) {
    return tiffHasGpsIfd(payload.subarray(EXIF_HEADER.length));
  }
  return XMP_GPS.test(decodeAscii(payload));
}

function payloadOf(bytes: Uint8Array, segment: JpegSegment): Uint8Array {
  return bytes.subarray(segment.start + 4, segment.end);
}

function tiffHasGpsIfd(tiff: Uint8Array): boolean {
  if (tiff.length < 8) {
    return false;
  }
  const little = tiff[0] === 0x49 && tiff[1] === 0x49;
  const big = tiff[0] === 0x4d && tiff[1] === 0x4d;
  if (!little && !big) {
    return false;
  }
  const read16 = (at: number): number =>
    little ? (tiff[at] ?? 0) | ((tiff[at + 1] ?? 0) << 8) : ((tiff[at] ?? 0) << 8) | (tiff[at + 1] ?? 0);
  const read32 = (at: number): number =>
    little
      ? (tiff[at] ?? 0) |
        ((tiff[at + 1] ?? 0) << 8) |
        ((tiff[at + 2] ?? 0) << 16) |
        ((tiff[at + 3] ?? 0) << 24)
      : ((tiff[at] ?? 0) << 24) |
        ((tiff[at + 1] ?? 0) << 16) |
        ((tiff[at + 2] ?? 0) << 8) |
        (tiff[at + 3] ?? 0);
  if (read16(2) !== 42) {
    return false;
  }
  const seen = new Set<number>();
  let ifd = read32(4);
  while (ifd >= 8 && ifd + 2 <= tiff.length && !seen.has(ifd)) {
    seen.add(ifd);
    const count = read16(ifd);
    for (let index = 0; index < count; index += 1) {
      const entry = ifd + 2 + index * 12;
      if (entry + 12 > tiff.length) {
        return false;
      }
      if (read16(entry) === GPS_IFD_TAG) {
        return true;
      }
    }
    const nextAt = ifd + 2 + count * 12;
    if (nextAt + 4 > tiff.length) {
      return false;
    }
    ifd = read32(nextAt);
  }
  return false;
}

function startsWith(bytes: Uint8Array, prefix: readonly number[]): boolean {
  if (bytes.length < prefix.length) {
    return false;
  }
  return prefix.every((value, index) => bytes[index] === value);
}

function decodeAscii(bytes: Uint8Array): string {
  let text = '';
  for (const value of bytes) {
    text += String.fromCharCode(value);
  }
  return text;
}

function copyBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}
