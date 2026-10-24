import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { ONBOARDING_STEPS } from '../onboarding/steps.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

test('shared onboarding cards stay aligned with the landing how-it-works copy', () => {
  const landing = readFileSync(path.join(repoRoot, 'apps/landing/i18n.js'), 'utf8');
  const fr = JSON.parse(readFileSync(path.join(repoRoot, 'packages/shared/src/i18n/fr.json'), 'utf8')) as {
    onboarding: Record<string, string>;
  };
  const en = JSON.parse(readFileSync(path.join(repoRoot, 'packages/shared/src/i18n/en.json'), 'utf8')) as {
    onboarding: Record<string, string>;
  };
  assert.deepEqual([...ONBOARDING_STEPS], ['describe', 'photos', 'plan', 'checklist']);
  assert.match(landing, /s1t: 'Décrivez votre maison'/);
  assert.match(landing, /s1t: 'Describe your home'/);
  assert.equal(fr.onboarding.describeTitle, 'Décrivez votre maison');
  assert.equal(en.onboarding.describeTitle, 'Describe your home');
  assert.equal(fr.onboarding.photosTitle, 'Ajoutez des photos');
  assert.equal(en.onboarding.checklistTitle, 'Follow the rebate checklist');
  assert.equal(fr.onboarding.heroTitle.includes('<'), false);
  assert.equal(en.onboarding.heroTitle.includes('<'), false);
});
