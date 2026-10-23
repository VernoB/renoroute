import { cleanup, fireEvent, render } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import { FreePreviewScreen } from './free-preview-screen';
import type { FreePreviewView } from './free-preview';

const locales = ['fr', 'en'] as const;

const copy = {
  fr: {
    title: 'Aperçu gratuit',
    cost: 'Coût estimé',
    savings: 'Économies annuelles',
    measures: 'Mesures à considérer',
    empty: 'Les fourchettes apparaîtront quand les coûts de référence seront vérifiés.',
    continue: 'Continuer vers les photos',
    airSealing: "Étanchéisation à l'air",
    disclaimer:
      "Ce plan n'est pas une évaluation énergétique officielle. Non affilié à Énergie NB.",
    unlock: 'Débloquer le plan complet',
  },
  en: {
    title: 'Free preview',
    cost: 'Estimated cost',
    savings: 'Annual savings',
    measures: 'Measures to consider',
    empty: 'Ranges will appear once reference costs are verified.',
    continue: 'Continue to photos',
    airSealing: 'Air sealing',
    disclaimer: 'This plan is not an official energy evaluation. Not affiliated with NB Power.',
    unlock: 'Unlock the full plan',
  },
} as const;

const fixture: FreePreviewView = {
  estimates: [
    {
      measure: 'air_sealing',
      cost: { low: 400, high: 1200 },
      annualSavingsCad: { low: 180, high: 432 },
      basis: 'benchmark:NB:air_sealing',
      confidence: 'high',
      missing: [],
    },
    {
      measure: 'smart_thermostat',
      cost: { low: 200, high: 400 },
      annualSavingsCad: { low: 180, high: 432 },
      basis: 'benchmark:NB:smart_thermostat',
      confidence: 'medium',
      missing: [],
    },
  ],
  totalCost: { low: 600, high: 1600 },
  totalSavings: { low: 360, high: 864 },
};

const emptyView: FreePreviewView = {
  estimates: [],
  totalCost: null,
  totalSavings: null,
};

describe('FreePreviewScreen', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  describe.each(locales)('%s', (locale) => {
    it('shows ranges, priority measures, the legal banner, and no payment', async () => {
      await i18n.changeLanguage(locale);
      const continued: string[] = [];
      const view = await render(
        <FreePreviewScreen
          onContinue={() => {
            continued.push('yes');
          }}
          view={fixture}
        />,
      );
      const text = copy[locale];
      expect(view.getByText(text.title)).toBeTruthy();
      expect(view.getByText(text.disclaimer)).toBeTruthy();
      expect(view.getByText(text.cost)).toBeTruthy();
      expect(view.getByText(text.savings)).toBeTruthy();
      expect(view.getByText(text.measures)).toBeTruthy();
      expect(view.getByText(text.airSealing)).toBeTruthy();
      expect(view.queryByText(text.unlock)).toBeNull();
      fireEvent.press(view.getByTestId('free-preview-continue'));
      expect(continued).toEqual(['yes']);
    });

    it('shows the empty state when no published benchmarks apply', async () => {
      await i18n.changeLanguage(locale);
      const view = await render(
        <FreePreviewScreen onContinue={() => undefined} view={emptyView} />,
      );
      const text = copy[locale];
      expect(view.getByText(text.empty)).toBeTruthy();
      expect(view.getByText(text.disclaimer)).toBeTruthy();
      expect(view.getByRole('button', { name: text.continue })).toBeTruthy();
      expect(view.queryByText(text.unlock)).toBeNull();
    });
  });
});
