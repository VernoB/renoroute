const GPS_TAG_KEYS = ['GPSLatitude', 'GPSLongitude', 'gps'] as const;

export function hasGpsExif(tags: Record<string, unknown>): boolean {
  return GPS_TAG_KEYS.some((key) => isPresentGpsValue(tags[key]));
}

function isPresentGpsValue(value: unknown): boolean {
  if (value === undefined || value === null || value === '') {
    return false;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value).length > 0;
  }
  return true;
}
