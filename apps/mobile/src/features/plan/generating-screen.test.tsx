import { cleanup, fireEvent, render } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import { GeneratingScreen } from './generating-screen';

const locales = ['fr', 'en'] as const;

const copy = {
  fr: {
    title: 'Préparation du plan',
    estimated: "Cela prend habituellement moins d'une minute.",
    photos: 'Analyse des photos',
    savings: 'Calcul des économies',
    programs: 'Recherche des programmes',
    write: 'Rédaction du plan',
    leave: 'Quitter',
    retry: 'Réessayer',
    error: 'La génération a échoué. Réessayez.',
  },
  en: {
    title: 'Preparing your plan',
    estimated: 'This usually takes less than a minute.',
    photos: 'Analyzing photos',
    savings: 'Calculating savings',
    programs: 'Looking up programs',
    write: 'Writing the plan',
    leave: 'Leave',
    retry: 'Try again',
    error: 'Generation failed. Try again.',
  },
} as const;

describe('GeneratingScreen', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  describe.each(locales)('%s', (locale) => {
    it('shows the four progress steps and a leave action', async () => {
      await i18n.changeLanguage(locale);
      const left: string[] = [];
      const view = await render(
        <GeneratingScreen
          errorReason={null}
          onLeave={() => {
            left.push('ok');
          }}
          onRetry={() => undefined}
          stepIndex={1}
        />,
      );
      const text = copy[locale];
      expect(view.getByText(text.title)).toBeTruthy();
      expect(view.getByText(text.estimated)).toBeTruthy();
      expect(view.getByText(text.photos)).toBeTruthy();
      expect(view.getByText(text.savings)).toBeTruthy();
      expect(view.getByText(text.programs)).toBeTruthy();
      expect(view.getByText(text.write)).toBeTruthy();
      fireEvent.press(view.getByRole('button', { name: text.leave }));
      expect(left).toEqual(['ok']);
    });

    it('shows a retry action after an error', async () => {
      await i18n.changeLanguage(locale);
      const retries: string[] = [];
      const view = await render(
        <GeneratingScreen
          errorReason="error"
          onLeave={() => undefined}
          onRetry={() => {
            retries.push('ok');
          }}
          stepIndex={3}
        />,
      );
      expect(view.getByText(copy[locale].error)).toBeTruthy();
      fireEvent.press(view.getByRole('button', { name: copy[locale].retry }));
      expect(retries).toEqual(['ok']);
    });
  });
});
