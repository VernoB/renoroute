import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

type EasConfig = {
  cli?: { appVersionSource?: string };
  build: Record<string, { autoIncrement?: boolean; environment?: string; channel?: string }>;
};

test('EAS profiles cover development, preview, and production without secrets', () => {
  const raw = readFileSync(new URL('./eas.json', import.meta.url), 'utf8');
  const config = JSON.parse(raw) as EasConfig;
  assert.deepEqual(Object.keys(config.build).sort(), ['development', 'preview', 'production']);
  assert.equal(config.build.development?.environment, 'development');
  assert.equal(config.build.preview?.environment, 'preview');
  assert.equal(config.build.production?.environment, 'production');
  assert.equal(config.build.preview?.channel, 'preview');
  assert.equal(config.cli?.appVersionSource, 'remote');
  assert.equal(config.build.production?.autoIncrement, true);
  assert.doesNotMatch(raw, /sk_|phc_|whsec_|eyJ/);
});
