/**
 * The harness exists for Playwright only.
 * Preview and production builds leave it closed even if the flag is copied by mistake.
 * A normal launch never navigates here.
 */
export function isE2eHarnessEnabled(input: {
  e2eFlag: string | undefined;
  appEnv: string | undefined;
}): boolean {
  if (input.e2eFlag !== '1') {
    return false;
  }
  if (input.appEnv === 'preview' || input.appEnv === 'production') {
    return false;
  }
  return true;
}
