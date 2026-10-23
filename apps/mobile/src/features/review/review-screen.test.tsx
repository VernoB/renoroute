import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';

import type { HomeInput } from '@renoroute/shared';

import i18n from '@/lib/i18n';

import { ReviewScreen, type ReviewScreenProps } from './review-screen';

const locales = ['fr', 'en'] as const;

const copy = {
  fr: {
    title: 'Révision',
    type: 'Type de maison',
    year: 'Année de construction',
    area: 'Superficie',
    heating: 'Chauffage',
    water: 'Chauffe-eau',
    bills: "Factures d'énergie",
    people: 'Occupants',
    income: 'Revenu du ménage (facultatif)',
    detached: 'Maison individuelle',
    utility: 'Énergie NB',
    photos: '2 photo(s)',
    noPhotos: '0 photo(s)',
    missing: 'Des renseignements manquent : le plan sera moins précis.',
    generate: 'Générer mon plan',
    needConsent: 'Le consentement IA est requis pour générer un plan.',
    disclaimer: "Ce plan n'est pas une évaluation énergétique officielle. Non affilié à Énergie NB.",
    offline: 'Connexion requise pour continuer.',
  },
  en: {
    title: 'Review',
    type: 'Home type',
    year: 'Year built',
    area: 'Floor area',
    heating: 'Heating',
    water: 'Water heater',
    bills: 'Energy bills',
    people: 'Occupants',
    income: 'Household income (optional)',
    detached: 'Detached house',
    utility: 'NB Power',
    photos: '2 photo(s)',
    noPhotos: '0 photo(s)',
    missing: 'Some details are missing: the plan will be less precise.',
    generate: 'Generate my plan',
    needConsent: 'AI consent is required to generate a plan.',
    disclaimer: 'This plan is not an official energy evaluation. Not affiliated with NB Power.',
    offline: 'A connection is required to continue.',
  },
} as const;

const completeHome: Partial<HomeInput> = {
  electricUtility: 'nb_power',
  heatingPrimary: 'electric_baseboard',
  homeType: 'detached',
  yearBuilt: 1978,
};

const consentAiAt = '2026-10-22T18:00:00.000Z';

async function renderReview(overrides: Partial<ReviewScreenProps> = {}) {
  return render(
    <ReviewScreen
      consentAiAt={consentAiAt}
      home={completeHome}
      offline={false}
      onGenerate={() => undefined}
      photoCount={2}
      {...overrides}
    />,
  );
}

describe('ReviewScreen', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  describe.each(locales)('%s', (locale) => {
    it('shows the home summary, photo count, disclaimer, and generate action', async () => {
      await i18n.changeLanguage(locale);
      await renderReview();
      const text = copy[locale];
      expect(screen.getByText(text.title)).toBeTruthy();
      expect(screen.getByText(text.type)).toBeTruthy();
      expect(screen.getByText(text.year)).toBeTruthy();
      expect(screen.getByText(text.area)).toBeTruthy();
      expect(screen.getByText(text.heating)).toBeTruthy();
      expect(screen.getByText(text.water)).toBeTruthy();
      expect(screen.getByText(text.bills)).toBeTruthy();
      expect(screen.getByText(text.people)).toBeTruthy();
      expect(screen.getByText(text.income)).toBeTruthy();
      expect(screen.getByText(text.detached)).toBeTruthy();
      expect(screen.getByText(text.utility)).toBeTruthy();
      expect(screen.getByText('1978')).toBeTruthy();
      expect(screen.getByText(text.photos)).toBeTruthy();
      expect(screen.getByText(text.disclaimer)).toBeTruthy();
      expect(screen.getByRole('button', { name: text.generate })).toBeTruthy();
      expect(screen.queryByText(text.missing)).toBeNull();
      expect(screen.queryByText(text.needConsent)).toBeNull();
    });

    it('warns when intake is incomplete', async () => {
      await i18n.changeLanguage(locale);
      await renderReview({ home: { electricUtility: 'nb_power' } });
      expect(screen.getByText(copy[locale].missing)).toBeTruthy();
    });

    it('warns when there are no photos', async () => {
      await i18n.changeLanguage(locale);
      await renderReview({ photoCount: 0 });
      expect(screen.getByText(copy[locale].noPhotos)).toBeTruthy();
      expect(screen.getByText(copy[locale].missing)).toBeTruthy();
    });

    it('disables generate without AI consent', async () => {
      const onGenerate = jest.fn();
      await i18n.changeLanguage(locale);
      await renderReview({ consentAiAt: null, onGenerate });
      const button = screen.getByRole('button', { name: copy[locale].generate });
      expect(button.props.accessibilityState.disabled).toBe(true);
      expect(screen.getByText(copy[locale].needConsent)).toBeTruthy();
      fireEvent.press(button);
      expect(onGenerate).not.toHaveBeenCalled();
    });

    it('disables generate while offline', async () => {
      const onGenerate = jest.fn();
      await i18n.changeLanguage(locale);
      await renderReview({ offline: true, onGenerate });
      const button = screen.getByRole('button', { name: copy[locale].generate });
      expect(button.props.accessibilityState.disabled).toBe(true);
      expect(screen.getByText(copy[locale].offline)).toBeTruthy();
      fireEvent.press(button);
      expect(onGenerate).not.toHaveBeenCalled();
    });
  });

  it('calls onGenerate when consent is present and online', async () => {
    const onGenerate = jest.fn();
    await i18n.changeLanguage('fr');
    await renderReview({ onGenerate });
    fireEvent.press(screen.getByRole('button', { name: copy.fr.generate }));
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });
});
