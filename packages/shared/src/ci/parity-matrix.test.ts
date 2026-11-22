import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

test('the parity matrix names mobile, web, and a note for every feature row', () => {
  const matrix = readFileSync(path.join(repoRoot, 'docs/parity-matrix.md'), 'utf8');
  const rows = matrix
    .split('\n')
    .filter((line) => line.startsWith('| ') && !line.includes('---') && !line.includes('Fonction'));
  assert.equal(rows.length >= 8, true);
  for (const row of rows) {
    const cells = row.split('|').map((cell) => cell.trim());
    assert.equal(cells.length >= 6, true);
    assert.equal((cells[2]?.length ?? 0) > 0, true);
    assert.equal((cells[3]?.length ?? 0) > 0, true);
    assert.equal((cells[5]?.length ?? 0) > 0, true);
  }
});
