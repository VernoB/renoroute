import { cleanup, render } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import { PlanItemScreen } from './plan-item-screen';

const locales = ['fr', 'en'] as const;

const copy = {
  fr: {
    disclaimer: "Ce plan n'est pas une évaluation énergétique officielle. Non affilié à Énergie NB.",
    cost: 'Coût estimé',
    savings: 'Économies annuelles',
    high: 'Confiance élevée',
  },
  en: {
    disclaimer: 'This plan is not an official energy evaluation. Not affiliated with NB Power.',
    cost: 'Estimated cost',
    savings: 'Annual savings',
    high: 'High confidence',
  },
} as const;

describe('PlanItemScreen', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  describe.each(locales)('%s', (locale) => {
    it('shows the measure detail, ranges, confidence, and legal notice', async () => {
      await i18n.changeLanguage(locale);
      const view = await render(
        <PlanItemScreen
          item={{
            id: 'item-1',
            priority: 1,
            title: 'Air sealing',
            rationale: 'Leaks',
            costLowCad: 400,
            costHighCad: 1200,
            savingsLowCad: 180,
            savingsHighCad: 400,
            confidence: 'high',
          }}
        />,
      );
      const text = copy[locale];
      expect(view.getByText('Air sealing')).toBeTruthy();
      expect(view.getByText('Leaks')).toBeTruthy();
      expect(view.getByText(text.disclaimer)).toBeTruthy();
      expect(view.getByText(text.cost)).toBeTruthy();
      expect(view.getByText(text.savings)).toBeTruthy();
      expect(view.getByText(text.high)).toBeTruthy();
    });
  });
});
