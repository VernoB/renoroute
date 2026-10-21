import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

function leafKeys(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return [prefix];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    leafKeys(child, prefix.length === 0 ? key : `${prefix}.${key}`),
  );
}

test('French and English catalogs have the same keys', () => {
  const dir = dirname(fileURLToPath(import.meta.url));
  const fr = JSON.parse(readFileSync(join(dir, 'fr.json'), 'utf8')) as unknown;
  const en = JSON.parse(readFileSync(join(dir, 'en.json'), 'utf8')) as unknown;
  assert.deepEqual(leafKeys(fr).sort(), leafKeys(en).sort());
});
