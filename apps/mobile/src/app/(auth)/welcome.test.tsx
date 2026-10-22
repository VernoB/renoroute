import { cleanup, render, screen } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import WelcomeScreen from './welcome';

describe('WelcomeScreen', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  it('shows the French title', async () => {
    await i18n.changeLanguage('fr');
    await render(<WelcomeScreen />);
    expect(screen.getByText('Votre plan de rénovation, étape par étape')).toBeTruthy();
    expect(screen.getByText('Des coûts estimés, en fourchettes')).toBeTruthy();
    expect(screen.getByText('Non affilié à Énergie NB')).toBeTruthy();
  });

  it('shows the English title', async () => {
    await i18n.changeLanguage('en');
    await render(<WelcomeScreen />);
    expect(screen.getByText('Your renovation plan, step by step')).toBeTruthy();
    expect(screen.getByText('Estimated costs, shown as ranges')).toBeTruthy();
    expect(screen.getByText('Not affiliated with NB Power')).toBeTruthy();
  });
});
