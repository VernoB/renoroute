import assert from 'node:assert/strict';
import { test } from 'node:test';

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

test('visualize client invokes the Edge Function and never throws on a bad payload', () => {
  const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'visualize-client.ts'), 'utf8');
  assert.match(source, /visualize-renovation/);
  assert.match(source, /visualizationResultSchema/);
  assert.match(source, /unavailableVisualization/);
  assert.doesNotMatch(source, /service_role/);
});
