import { cleanup, render, screen } from '@testing-library/react-native';

import { DASHBOARD_STATES, type DashboardState } from '@renoroute/shared';

import i18n from '@/lib/i18n';

import { DashboardScreen } from './dashboard-screen';

const locales = ['fr', 'en'] as const;

const copy = {
  fr: {
    homeCard: 'Votre maison',
    percent: '40 % rempli',
    nextAction: 'Prochaine action',
    planCard: 'Votre plan',
    rebatesCard: 'Subventions : une étape urgente',
    no_home: {
      status: 'Ajoutez votre première maison pour commencer.',
      next: 'Décrire la maison',
    },
    intake_partial: {
      status: 'Continuez la description de la maison.',
      next: 'Terminer la description',
    },
    plan_preview: {
      status: 'Votre aperçu de plan est prêt.',
      next: "Voir l'aperçu du plan",
    },
    plan_complete: {
      status: 'Votre plan complet est déverrouillé.',
      next: 'Ouvrir le plan',
    },
  },
  en: {
    homeCard: 'Your home',
    percent: '40% complete',
    nextAction: 'Next action',
    planCard: 'Your plan',
    rebatesCard: 'Rebates: one urgent step',
    no_home: {
      status: 'Add your first home to get started.',
      next: 'Describe the home',
    },
    intake_partial: {
      status: 'Continue describing the home.',
      next: 'Finish the description',
    },
    plan_preview: {
      status: 'Your plan preview is ready.',
      next: 'Open the plan preview',
    },
    plan_complete: {
      status: 'Your full plan is unlocked.',
      next: 'Open the plan',
    },
  },
} as const;

function renderDashboard(state: DashboardState, offline = false) {
  return render(
    <DashboardScreen
      homeLabel="Maison-A"
      offline={offline}
      onNext={() => undefined}
      percent={40}
      state={state}
    />,
  );
}

describe('DashboardScreen', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  describe.each(locales)('%s', (locale) => {
    describe.each(DASHBOARD_STATES)('%s', (state) => {
      it('shows the home, next-action, plan, and rebates cards', async () => {
        await i18n.changeLanguage(locale);
        await renderDashboard(state);
        const text = copy[locale];
        expect(screen.getByText(text.homeCard)).toBeTruthy();
        expect(screen.getByText('Maison-A')).toBeTruthy();
        expect(screen.getByText(text.percent)).toBeTruthy();
        expect(screen.getByText(text.nextAction)).toBeTruthy();
        expect(screen.getByText(text[state].status)).toBeTruthy();
        expect(screen.getByText(text[state].next)).toBeTruthy();
        expect(screen.getByText(text.planCard)).toBeTruthy();
        expect(screen.getByText(text.rebatesCard)).toBeTruthy();
      });
    });
  });

  it('disables the next action while offline', async () => {
    await i18n.changeLanguage('fr');
    await renderDashboard('no_home', true);
    expect(
      screen.getByRole('button', { name: copy.fr.no_home.next }).props.accessibilityState.disabled,
    ).toBe(true);
  });
});
