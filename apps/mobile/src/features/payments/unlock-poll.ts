export type UnlockPollResult = 'unlocked' | 'timeout';

export async function pollUnlockedAt(
  load: () => Promise<string | null>,
  options: { intervalMs?: number; timeoutMs?: number; sleep?: (ms: number) => Promise<void> } = {},
): Promise<UnlockPollResult> {
  const intervalMs = options.intervalMs ?? 1000;
  const timeoutMs = options.timeoutMs ?? 30_000;
  const sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const started = Date.now();
  while (Date.now() - started <= timeoutMs) {
    const unlockedAt = await load();
    if (unlockedAt) {
      return 'unlocked';
    }
    if (Date.now() - started + intervalMs > timeoutMs) {
      break;
    }
    await sleep(intervalMs);
  }
  return 'timeout';
}
