import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { BRAND } from '@renoroute/shared/config/brand';

const flowPath = join(dirname(fileURLToPath(import.meta.url)), '.maestro', 'app-launches.yaml');
const flow = readFileSync(flowPath, 'utf8');

describe('app launches flow', () => {
  it('targets the Android package from BRAND and waits for the product name', () => {
    assert.match(flow, new RegExp(`^appId: ${BRAND.androidPackage}$`, 'm'));
    assert.match(flow, /^- launchApp$/m);
    assert.match(flow, new RegExp(`visible: ${BRAND.name}`));
    assert.match(flow, new RegExp(`assertVisible: ${BRAND.name}`));
  });
});
