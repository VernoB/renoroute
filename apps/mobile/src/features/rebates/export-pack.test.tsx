import type { VisibleRebateProgram } from '@renoroute/shared';

import type { PlanView } from '@/features/plan/plan-view';

import { exportSubsidyPackPdf, planLinesForPack } from './export-pack';

const program: VisibleRebateProgram = {
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
      id: 'ok',
      kind: 'document',
      labelFr: 'Formulaire officiel',
      labelEn: 'Official form',
      sourceUrl: 'https://TODO-verify-official-url',
      isPublished: true,
    },
  ],
};

const plan: PlanView = {
  id: 'plan-1',
  unlocked: false,
  totalCostLowCad: 400,
  totalCostHighCad: 1200,
  annualSavingsLowCad: null,
  annualSavingsHighCad: null,
  rebateLowCad: null,
  rebateHighCad: null,
  items: [
    {
      id: 'i1',
      priority: 1,
      title: 'Air sealing',
      rationale: 'Cut drafts.',
      costLowCad: 400,
      costHighCad: 1200,
      savingsLowCad: null,
      savingsHighCad: null,
      confidence: 'high',
    },
    {
      id: 'i3',
      priority: 3,
      title: 'Locked item',
      rationale: 'Hidden until unlock.',
      costLowCad: null,
      costHighCad: null,
      savingsLowCad: null,
      savingsHighCad: null,
      confidence: 'low',
    },
  ],
};

const enCopy: Record<string, string> = {
  'rebates.packTitle': 'Ready-to-submit pack',
  'review.disclaimer':
    'This plan is not an official energy evaluation. Not affiliated with NB Power.',
  'rebates.noFiling': 'The app does not file the application.',
  'rebates.packForContractor': 'For the contractor',
  'rebates.packForAdvisor': 'For the advisor',
  'rebates.packEmptyDossier': 'No published documents for this program.',
  'rebates.packEmptyPlan': 'The plan will appear here once it is generated.',
  'rebates.kind.document': 'Document',
  'rebates.kind.invoice': 'Invoice',
  'rebates.kind.model_number': 'Model number',
  'rebates.kind.deadline': 'Deadline',
  'rebates.kind.reminder': 'Reminder',
};

describe('export pack', () => {
  it('omits locked plan items from a preview pack', () => {
    expect(planLinesForPack(plan).map((line) => line.title)).toEqual(['Air sealing']);
  });

  it('prints an English legal pack without filing the application', async () => {
    const printed: string[] = [];
    await exportSubsidyPackPdf({
      locale: 'en',
      plan,
      printer: {
        print: async (html) => {
          printed.push(html);
        },
      },
      programs: [program],
      t: (key) => enCopy[key] ?? key,
    });
    expect(printed[0]).toContain('This plan is not an official energy evaluation');
    expect(printed[0]).toContain('The app does not file the application');
    expect(printed[0]).toContain('Official form');
    expect(printed[0]).toContain('Air sealing');
    expect(printed[0]).not.toContain('Locked item');
  });

  it('prints a French legal pack without filing the application', async () => {
    const printed: string[] = [];
    const frCopy: Record<string, string> = {
      'rebates.packTitle': 'Dossier prêt à soumettre',
      'review.disclaimer':
        "Ce plan n'est pas une évaluation énergétique officielle. Non affilié à Énergie NB.",
      'rebates.noFiling': "L'app ne dépose pas la demande.",
      'rebates.packForContractor': "Pour l'entrepreneur",
      'rebates.packForAdvisor': 'Pour le conseiller',
      'rebates.packEmptyDossier': 'Aucun document publié pour ce programme.',
      'rebates.packEmptyPlan': 'Le plan apparaîtra ici une fois généré.',
      'rebates.kind.document': 'Document',
      'rebates.kind.invoice': 'Facture',
      'rebates.kind.model_number': 'Numéro de modèle',
      'rebates.kind.deadline': 'Échéance',
      'rebates.kind.reminder': 'Rappel',
    };
    await exportSubsidyPackPdf({
      locale: 'fr',
      plan,
      printer: {
        print: async (html) => {
          printed.push(html);
        },
      },
      programs: [program],
      t: (key) => frCopy[key] ?? key,
    });
    expect(printed[0]).toContain("Ce plan n'est pas une évaluation énergétique officielle");
    expect(printed[0]).toContain("L'app ne dépose pas la demande");
    expect(printed[0]).toContain('Formulaire officiel');
  });
});
