export { optionalNative } from './optional-native-safe.ts';

/**
 * Node and `tsc` resolve this file. Metro uses `optional-native.native.ts`
 * and `optional-native.web.ts`, which load the real Expo modules.
 * A top-level import of `expo-modules-core` crashes the node test runner.
 */
export function optionalExpo<T>(moduleName: string, load: () => T): T | null {
  void moduleName;
  void load;
  return null;
}

export async function loadOptionalModule<T>(
  moduleName: string,
  load: () => Promise<T>,
): Promise<T | null> {
  void moduleName;
  void load;
  return null;
}
