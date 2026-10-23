import assert from 'node:assert/strict';
import { test } from 'node:test';

import { mockPurchasesClient, purchasesClientFromEnv } from './purchases-client.ts';

test('placeholder RevenueCat keys stay on the mock client', async () => {
  const client = purchasesClientFromEnv('appl_replace_me', {
    async purchase() {
      return { ok: true };
    },
  });
  const result = await client.purchase('plan_49');
  assert.deepEqual(result, { ok: false, reason: 'not_configured' });
});

test('the mock can simulate a sandbox purchase', async () => {
  const result = await mockPurchasesClient({ ok: true }).purchase('plan_99');
  assert.deepEqual(result, { ok: true });
});
