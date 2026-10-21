export type MaestroPlan = 'missing-flow' | 'skip' | 'run';

/** The device flow runs only when the CLI, adb, and an online emulator are all present. */
export function maestroPlan(input: {
  flowExists: boolean;
  maestroInstalled: boolean;
  adbInstalled: boolean;
  deviceOnline: boolean;
}): MaestroPlan {
  if (!input.flowExists) {
    return 'missing-flow';
  }
  if (!input.maestroInstalled || !input.adbInstalled || !input.deviceOnline) {
    return 'skip';
  }
  return 'run';
}
