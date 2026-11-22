import { requireOptionalNativeModule } from 'expo-modules-core';

import { optionalNative } from './optional-native-safe.ts';

function nativeModulePresent(moduleName: string): boolean {
  try {
    return requireOptionalNativeModule<unknown>(moduleName) != null;
  } catch {
    return false;
  }
}

export function optionalExpo<T>(moduleName: string, load: () => T): T | null {
  if (!nativeModulePresent(moduleName)) {
    return null;
  }
  return optionalNative(load);
}

export async function loadOptionalModule<T>(
  moduleName: string,
  load: () => Promise<T>,
): Promise<T | null> {
  if (!nativeModulePresent(moduleName)) {
    return null;
  }
  try {
    return await load();
  } catch {
    return null;
  }
}
