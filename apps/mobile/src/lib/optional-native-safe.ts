/** Load an Expo native module without crashing older debug binaries. */

export function optionalNative<T>(load: () => T): T | null {
  try {
    return load();
  } catch {
    return null;
  }
}
