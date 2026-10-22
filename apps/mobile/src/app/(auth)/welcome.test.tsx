import { render, screen } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import WelcomeScreen from './welcome';

describe('WelcomeScreen', () => {
  afterEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('shows the French title', async () => {
    await i18n.changeLanguage('fr');
    await render(<WelcomeScreen />);
    expect(screen.getByText('Votre plan de rénovation, étape par étape')).toBeTruthy();
  });

  it('shows the English title', async () => {
    await i18n.changeLanguage('en');
    await render(<WelcomeScreen />);
    expect(screen.getByText('Your renovation plan, step by step')).toBeTruthy();
  });
});
