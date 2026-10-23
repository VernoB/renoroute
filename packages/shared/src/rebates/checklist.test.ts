import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ADVISOR_DIRECTORY_URL,
  homeownerStatus,
  needsAdvisorStep,
  publishedDossierItems,
  visibleRebatePrograms,
  type RebateProgramSource,
} from './checklist.ts';

function program(overrides: Partial<RebateProgramSource> = {}): RebateProgramSource {
  return {
    id: 'p1',
    slug: 'nbp-total-home-energy-savings',
    nameFr: 'Toute la maison',
    nameEn: 'Total Home',
    administrator: 'NB Power',
    status: 'open',
    requiresPreEvaluation: true,
    completionWindowMonths: 9,
    officialUrl: null,
    sourceUrl: 'https://TODO-verify-official-url',
    lastVerifiedAt: '2026-10-19',
    isPublished: true,
    rules: [],
    dossierItems: [],
    ...overrides,
  };
}

test('closed programs are hidden and announced programs are upcoming', () => {
  assert.equal(homeownerStatus('closed'), null);
  assert.equal(homeownerStatus('announced'), 'upcoming');
  assert.equal(homeownerStatus('open'), 'open');
  const visible = visibleRebatePrograms(
    [
      program({ id: 'closed', status: 'closed' }),
      program({ id: 'soon', status: 'announced', requiresPreEvaluation: false }),
      program({ id: 'draft', isPublished: false }),
    ],
    '2026-01-15',
  );
  assert.deepEqual(
    visible.map((row) => row.id),
    ['soon'],
  );
  assert.equal(visible[0]?.status, 'upcoming');
});

test('the work deadline uses the program window, not a hardcoded nine months', () => {
  const nine = visibleRebatePrograms([program()], '2026-01-15');
  assert.equal(nine[0]?.deadline, '2026-10-15');
  const six = visibleRebatePrograms([program({ completionWindowMonths: 6 })], '2026-01-15');
  assert.equal(six[0]?.deadline, '2026-07-15');
  const waiting = visibleRebatePrograms([program()], null);
  assert.equal(waiting[0]?.deadline, null);
});

test('advisor step appears when a visible program requires a pre-evaluation', () => {
  const withAdvisor = visibleRebatePrograms([program()], null);
  assert.equal(needsAdvisorStep(withAdvisor), true);
  assert.equal(withAdvisor[0]?.officialUrl, ADVISOR_DIRECTORY_URL);
  const without = visibleRebatePrograms(
    [program({ requiresPreEvaluation: false, officialUrl: 'https://TODO-verify-official-url' })],
    null,
  );
  assert.equal(needsAdvisorStep(without), false);
});

test('dossier lines without a published https source stay hidden', () => {
  assert.deepEqual(
    publishedDossierItems([
      {
        id: 'a',
        kind: 'document',
        labelFr: 'Facture',
        labelEn: 'Invoice',
        sourceUrl: null,
        isPublished: true,
      },
      {
        id: 'b',
        kind: 'document',
        labelFr: 'Formulaire',
        labelEn: 'Form',
        sourceUrl: 'https://TODO-verify-official-url',
        isPublished: true,
      },
    ]).map((row) => row.id),
    ['b'],
  );
});
