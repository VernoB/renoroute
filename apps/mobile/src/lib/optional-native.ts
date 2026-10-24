/** Load an Expo native module without crashing older debug binaries. */

export function optionalNative<T>(load: () => T): T | null {
  try {
    return load();
  } catch {
    return null;
  }
}

type ExpoCore = {
  requireOptionalNativeModule?: (name: string) => unknown;
};

export function optionalExpo<T>(moduleName: string, load: () => T): T | null {
  const core = optionalNative(() => require('expo-modules-core') as ExpoCore);
  if (!core?.requireOptionalNativeModule?.(moduleName)) {
    return null;
  }
  return optionalNative(load);
}
