import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { isE2eHarnessEnabled } from './e2e-harness.ts';

test('the harness stays closed unless a local E2E flag is set', () => {
  assert.equal(isE2eHarnessEnabled({ e2eFlag: undefined, appEnv: undefined }), false);
  assert.equal(isE2eHarnessEnabled({ e2eFlag: '1', appEnv: 'preview' }), false);
  assert.equal(isE2eHarnessEnabled({ e2eFlag: '1', appEnv: 'production' }), false);
  assert.equal(isE2eHarnessEnabled({ e2eFlag: '1', appEnv: 'local' }), true);
});

test('the home route opens welcome, not the harness', () => {
  const index = readFileSync(new URL('../../app/index.tsx', import.meta.url), 'utf8');
  assert.match(index, /href="\/\(auth\)\/welcome"/);
  assert.doesNotMatch(index, /e2e/);
});
