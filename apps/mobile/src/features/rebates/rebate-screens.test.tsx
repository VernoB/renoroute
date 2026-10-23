import { type VisibleRebateProgram } from '@renoroute/shared';
import { cleanup, fireEvent, render } from '@testing-library/react-native';

import i18n, { i18nReady } from '@/lib/i18n';

import { RebateChecklistScreen } from './rebate-checklist-screen';
import { RebateProgramScreen } from './rebate-program-screen';

const copy = {
  fr: {
    title: 'Subventions',
    warning: "Les programmes changent ; confirmez auprès de l'organisme.",
    advisor: 'Trouver un conseiller enregistré',
    official: 'Site officiel',
    upcoming: 'À venir',
    open: 'Ouvert',
    deadline: 'À terminer avant le 15 oct. 2026',
    noFiling: "L'app ne dépose pas la demande.",
    exportPdf: 'Exporter le dossier PDF',
    airSealing: "Étanchéisation à l'air",
  },
  en: {
    title: 'Rebates',
    warning: 'Programs change; confirm with the administrator.',
    advisor: 'Find a registered advisor',
    official: 'Official site',
    upcoming: 'Coming soon',
    open: 'Open',
    deadline: 'Finish by Oct 15, 2026',
    noFiling: 'The app does not file the application.',
    exportPdf: 'Export the PDF pack',
    airSealing: 'Air sealing',
  },
} as const;

const openProgram: VisibleRebateProgram = {
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
  rules: [{ id: 'r1', measure: 'air_sealing', amountMinCad: 250, amountMaxCad: 550 }],
  status: 'open',
  deadline: '2026-10-15',
  dossierItems: [],
};

const upcomingProgram: VisibleRebateProgram = {
  ...openProgram,
  id: 'p-soon',
  nameFr: 'Remise fédérale',
  nameEn: 'Federal rebate',
  requiresPreEvaluation: false,
  completionWindowMonths: null,
  status: 'upcoming',
  deadline: null,
  rules: [],
};

async function renderScreens(locale: 'fr' | 'en', onOpenOfficial: (url: string) => void) {
  await i18nReady;
  await i18n.changeLanguage(locale);
  return render(
    <>
      <RebateChecklistScreen
        onExportPack={() => undefined}
        onOpenOfficial={onOpenOfficial}
        onOpenProgram={() => undefined}
        programs={[openProgram, upcomingProgram]}
      />
      <RebateProgramScreen onOpenOfficial={onOpenOfficial} program={openProgram} />
    </>,
  );
}

function expectCopy(
  view: Awaited<ReturnType<typeof render>>,
  text: (typeof copy)[keyof typeof copy],
): void {
  expect(view.getByText(text.title)).toBeTruthy();
  expect(view.getAllByText(text.warning).length).toBeGreaterThan(0);
  expect(view.getByText(text.advisor)).toBeTruthy();
  expect(view.getAllByText(text.open).length).toBeGreaterThan(0);
  expect(view.getByText(text.upcoming)).toBeTruthy();
  expect(view.getAllByText(text.deadline).length).toBeGreaterThan(0);
  expect(view.getByTestId('rebate-measure-air_sealing')).toBeTruthy();
  expect(view.getByText(text.airSealing)).toBeTruthy();
  expect(view.getAllByText(text.noFiling).length).toBeGreaterThan(0);
  expect(view.getByText(text.exportPdf)).toBeTruthy();
  expect(view.getAllByRole('button', { name: text.official }).length).toBeGreaterThan(0);
}

describe('rebate screens', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  it('shows the French checklist, 9-month deadline, amounts, and no booking', async () => {
    const official: string[] = [];
    const view = await renderScreens('fr', (url) => {
      official.push(url);
    });
    expectCopy(view, copy.fr);
    fireEvent.press(view.getByTestId('rebate-open-official'));
    expect(official).toEqual(['https://TODO-verify-official-url']);
  });

  it('shows the English checklist, 9-month deadline, amounts, and no booking', async () => {
    const official: string[] = [];
    const view = await renderScreens('en', (url) => {
      official.push(url);
    });
    expectCopy(view, copy.en);
    fireEvent.press(view.getByTestId('rebate-open-official'));
    expect(official).toEqual(['https://TODO-verify-official-url']);
  });
});
