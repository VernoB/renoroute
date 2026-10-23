/** Independent ExifTool tags that mean the file still has a GPS location. */
export type ExifToolGpsTags = {
  GPSLatitude?: unknown;
  GPSLongitude?: unknown;
  GPSPosition?: unknown;
  GPSLatitudeRef?: unknown;
  GPSLongitudeRef?: unknown;
};

export type ExifDevicePlan = 'skip' | 'android' | 'ios' | 'both';

export function exifToolSawGps(tags: ExifToolGpsTags): boolean {
  return (
    isPresent(tags.GPSLatitude) ||
    isPresent(tags.GPSLongitude) ||
    isPresent(tags.GPSPosition) ||
    isPresent(tags.GPSLatitudeRef) ||
    isPresent(tags.GPSLongitudeRef)
  );
}

export function exifDevicePlan(input: {
  androidOnline: boolean;
  iosOnline: boolean;
}): ExifDevicePlan {
  if (input.androidOnline && input.iosOnline) {
    return 'both';
  }
  if (input.androidOnline) {
    return 'android';
  }
  if (input.iosOnline) {
    return 'ios';
  }
  return 'skip';
}

function isPresent(value: unknown): boolean {
  if (value === undefined || value === null || value === '') {
    return false;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return true;
}
