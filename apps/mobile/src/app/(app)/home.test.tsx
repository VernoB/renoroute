import { cleanup, render, screen } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import HomeScreen from './home';

describe('HomeScreen', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  it('shows the French title', async () => {
    await i18n.changeLanguage('fr');
    await render(<HomeScreen />);
    expect(screen.getByText('Votre maison')).toBeTruthy();
  });

  it('shows the English title', async () => {
    await i18n.changeLanguage('en');
    await render(<HomeScreen />);
    expect(screen.getByText('Your home')).toBeTruthy();
  });
});
