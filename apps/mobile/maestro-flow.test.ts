import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { BRAND } from '@renoroute/shared/config/brand';

const flowPath = join(dirname(fileURLToPath(import.meta.url)), '.maestro', 'app-launches.yaml');
const paywallPath = join(dirname(fileURLToPath(import.meta.url)), '.maestro', 'paywall.yaml');
const flow = readFileSync(flowPath, 'utf8');
const paywall = readFileSync(paywallPath, 'utf8');

describe('app launches flow', () => {
  it('receives the iOS bundle id and waits for a test id', () => {
    const runner = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../../scripts/run-maestro.ts'),
      'utf8',
    );
    assert.match(flow, /^appId: \$\{APP_ID\}$/m);
    assert.match(flow, /^- launchApp$/m);
    assert.match(flow, /id: app-ready/);
    assert.doesNotMatch(flow, new RegExp(BRAND.name));
    assert.match(runner, new RegExp(`APP_ID=\\$\\{BRAND\\.iosBundleId\\}`));
  });

  it('does not enter a real card or store purchase in the paywall flow', () => {
    assert.match(paywall, /Sandbox only/);
    assert.doesNotMatch(paywall, /4242/);
    assert.doesNotMatch(paywall, /stripe\.com/i);
    assert.doesNotMatch(paywall, /purchasePackage/);
  });
});
