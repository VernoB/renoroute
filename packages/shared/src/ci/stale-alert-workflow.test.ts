import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

test('the weekly stale-program workflow is pinned and does not send mail by itself', () => {
  const workflow = readFileSync(
    path.join(repoRoot, '.github/workflows/stale-rebate-alert.yml'),
    'utf8',
  );
  assert.match(workflow, /cron: '0 13 \* \* 1'/);
  assert.match(workflow, /scripts\/stale-program-alert.ts/);
  assert.match(workflow, /ADMIN_ALERT_EMAIL/);
  assert.match(workflow, /actions\/checkout@11bd71901bbe5b1630ceea73d27597364c9af683/);
  assert.equal(workflow.includes('sk_live'), false);
  assert.equal(workflow.includes('service_role'), false);
  assert.equal(workflow.includes('smtp'), false);
});
