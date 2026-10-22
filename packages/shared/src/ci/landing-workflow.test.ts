import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

describe('landing pages workflow', () => {
  it('deploys from the monorepo root when the landing changes', () => {
    const workflow = readFileSync(
      path.join(repoRoot, '.github/workflows/landing-pages.yml'),
      'utf8',
    );
    assert.match(workflow, /apps\/landing\/\*\*/);
    assert.match(workflow, /working-directory:\s*apps\/landing/);
    assert.equal(
      existsSync(path.join(repoRoot, 'apps/landing/.github/workflows/pages.yml')),
      false,
    );
  });
});
