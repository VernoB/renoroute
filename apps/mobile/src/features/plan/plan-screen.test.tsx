import { cleanup, fireEvent, render } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import { PlanScreen } from './plan-screen';
import type { PlanView } from './plan-view';

const locales = ['fr', 'en'] as const;

const copy = {
  fr: {
    title: 'Votre plan',
    cost: 'Coût estimé',
    unlock: 'Débloquer le plan complet',
    locked: 'Mesure 3 verrouillée',
    disclaimer: "Ce plan n'est pas une évaluation énergétique officielle. Non affilié à Énergie NB.",
    high: 'Confiance élevée',
  },
  en: {
    title: 'Your plan',
    cost: 'Estimated cost',
    unlock: 'Unlock the full plan',
    locked: 'Measure 3 locked',
    disclaimer: 'This plan is not an official energy evaluation. Not affiliated with NB Power.',
    high: 'High confidence',
  },
} as const;

const fixture = (unlocked: boolean): PlanView => ({
  id: 'plan-1',
  unlocked,
  totalCostLowCad: 4000,
  totalCostHighCad: 9000,
  annualSavingsLowCad: 400,
  annualSavingsHighCad: 800,
  rebateLowCad: 200,
  rebateHighCad: 500,
  items: [
    {
      id: 'item-1',
      priority: 1,
      title: 'Air sealing',
      rationale: 'Leaks',
      costLowCad: 400,
      costHighCad: 1200,
      savingsLowCad: 180,
      savingsHighCad: 400,
      confidence: 'high',
    },
    {
      id: 'item-2',
      priority: 2,
      title: 'Attic',
      rationale: 'Thin attic',
      costLowCad: 2800,
      costHighCad: 5600,
      savingsLowCad: 200,
      savingsHighCad: 400,
      confidence: 'medium',
    },
    {
      id: 'item-3',
      priority: 3,
      title: 'Windows',
      rationale: 'Old sashes',
      costLowCad: 8000,
      costHighCad: 14000,
      savingsLowCad: 100,
      savingsHighCad: 200,
      confidence: 'low',
    },
  ],
});

describe('PlanScreen', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  describe.each(locales)('%s', (locale) => {
    it('shows the disclaimer, ranges, and locks later items in preview', async () => {
      await i18n.changeLanguage(locale);
      const opened: string[] = [];
      const view = await render(
        <PlanScreen
          onOpenItem={(item) => {
            opened.push(item.id);
          }}
          onUnlock={() => undefined}
          plan={fixture(false)}
        />,
      );
      const text = copy[locale];
      expect(view.getByText(text.title)).toBeTruthy();
      expect(view.getByText(text.disclaimer)).toBeTruthy();
      expect(view.getByText(text.cost)).toBeTruthy();
      expect(view.getByText('1. Air sealing')).toBeTruthy();
      expect(view.getByText(text.high)).toBeTruthy();
      expect(view.getByText(text.locked)).toBeTruthy();
      expect(view.queryByText('3. Windows')).toBeNull();
      expect(view.getByRole('button', { name: text.unlock })).toBeTruthy();
      fireEvent.press(view.getByTestId('plan-item-1'));
      expect(opened).toEqual(['item-1']);
    });
  });
});
