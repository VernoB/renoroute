import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

describe('function privacy copy', () => {
  it('matches the shared observability module byte for byte', () => {
    const shared = readFileSync(
      path.join(repoRoot, 'packages/shared/src/observability/privacy.ts'),
    );
    const copy = readFileSync(path.join(repoRoot, 'supabase/functions/_shared/privacy.ts'));
    assert.deepEqual(copy, shared);
  });
});
