import assert from 'node:assert/strict';
import { test } from 'node:test';

import { pollUnlockedAt } from './unlock-poll.ts';

test('pollUnlockedAt returns unlocked when unlocked_at appears', async () => {
  let calls = 0;
  const result = await pollUnlockedAt(
    async () => {
      calls += 1;
      return calls >= 2 ? '2026-10-23T16:00:00.000Z' : null;
    },
    { intervalMs: 1, timeoutMs: 50, sleep: async () => undefined },
  );
  assert.equal(result, 'unlocked');
  assert.equal(calls >= 2, true);
});

test('pollUnlockedAt times out when the plan stays locked', async () => {
  const result = await pollUnlockedAt(async () => null, {
    intervalMs: 1,
    timeoutMs: 1,
    sleep: async () => undefined,
  });
  assert.equal(result, 'timeout');
});
