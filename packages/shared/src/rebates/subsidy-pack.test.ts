import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { VisibleRebateProgram } from './checklist.ts';
import { buildSubsidyPack, type SubsidyPackCopy } from './subsidy-pack.ts';

const copy = {
  fr: {
    title: 'Dossier prêt à soumettre',
    disclaimer:
      "Ce plan n'est pas une évaluation énergétique officielle. Non affilié à Énergie NB.",
    noFiling: "L'app ne dépose pas la demande.",
    forContractor: "Pour l'entrepreneur",
    forAdvisor: 'Pour le conseiller',
    emptyDossier: 'Aucun document publié pour ce programme.',
    emptyPlan: 'Le plan apparaîtra ici une fois généré.',
    kind: {
      document: 'Document',
      invoice: 'Facture',
      model_number: 'Numéro de modèle',
      deadline: 'Échéance',
      reminder: 'Rappel',
    },
  },
  en: {
    title: 'Ready-to-submit pack',
    disclaimer: 'This plan is not an official energy evaluation. Not affiliated with NB Power.',
    noFiling: 'The app does not file the application.',
    forContractor: 'For the contractor',
    forAdvisor: 'For the advisor',
    emptyDossier: 'No published documents for this program.',
    emptyPlan: 'The plan will appear here once it is generated.',
    kind: {
      document: 'Document',
      invoice: 'Invoice',
      model_number: 'Model number',
      deadline: 'Deadline',
      reminder: 'Reminder',
    },
  },
} as const satisfies Record<'fr' | 'en', SubsidyPackCopy>;

function program(overrides: Partial<VisibleRebateProgram> = {}): VisibleRebateProgram {
  return {
    id: 'p-open',
    slug: 'nbp-total-home-energy-savings',
    nameFr: 'Toute la maison',
    nameEn: 'Total Home',
    administrator: 'NB Power',
    requiresPreEvaluation: true,
    completionWindowMonths: 9,
    officialUrl: 'https://TODO-verify-official-url',
    sourceUrl: 'https://TODO-verify-official-url',
    lastVerifiedAt: '2026-10-19',
    isPublished: true,
    rules: [],
    status: 'open',
    deadline: '2026-10-15',
    dossierItems: [
      {
        id: 'hidden-draft',
        kind: 'document',
        labelFr: 'Brouillon secret',
        labelEn: 'Secret draft',
        sourceUrl: 'https://TODO-verify-official-url',
        isPublished: false,
      },
      {
        id: 'no-source',
        kind: 'invoice',
        labelFr: 'Facture sans source',
        labelEn: 'Invoice without source',
        sourceUrl: null,
        isPublished: true,
      },
      {
        id: 'http-only',
        kind: 'reminder',
        labelFr: 'Rappel http',
        labelEn: 'Http reminder',
        sourceUrl: 'http://example.com',
        isPublished: true,
      },
      {
        id: 'ok',
        kind: 'model_number',
        labelFr: 'Numéro de thermopompe',
        labelEn: 'Heat-pump model number',
        sourceUrl: 'https://TODO-verify-official-url',
        isPublished: true,
      },
    ],
    ...overrides,
  };
}

test('the French pack keeps only published https dossier lines and the legal banner', () => {
  const pack = buildSubsidyPack({
    appName: 'RénoRoute',
    copy: copy.fr,
    locale: 'fr',
    planLines: [{ title: 'Étanchéisation', rationale: 'Réduire les fuites.' }],
    programs: [program()],
  });
  assert.match(pack.html, /Ce plan n'est pas une évaluation énergétique officielle/);
  assert.match(pack.html, /L'app ne dépose pas la demande/);
  assert.match(pack.html, /Pour l'entrepreneur/);
  assert.match(pack.html, /Pour le conseiller/);
  assert.match(pack.html, /Numéro de thermopompe/);
  assert.deepEqual(pack.dossierLines, ['Numéro de thermopompe']);
  assert.equal(pack.html.includes('Brouillon secret'), false);
  assert.equal(pack.html.includes('Facture sans source'), false);
  assert.equal(pack.html.includes('Rappel http'), false);
  assert.equal(pack.html.includes('déposer la demande maintenant'), false);
});

test('the English pack keeps only published https dossier lines and the legal banner', () => {
  const pack = buildSubsidyPack({
    appName: 'RénoRoute',
    copy: copy.en,
    locale: 'en',
    planLines: [],
    programs: [program()],
  });
  assert.match(pack.html, /This plan is not an official energy evaluation/);
  assert.match(pack.html, /The app does not file the application/);
  assert.match(pack.html, /For the contractor/);
  assert.match(pack.html, /For the advisor/);
  assert.match(pack.html, /Heat-pump model number/);
  assert.match(pack.html, /The plan will appear here once it is generated/);
  assert.deepEqual(pack.dossierLines, ['Heat-pump model number']);
  assert.equal(pack.html.includes('Secret draft'), false);
  assert.equal(pack.html.includes('file this application now'), false);
});
