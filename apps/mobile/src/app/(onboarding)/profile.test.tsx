import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import { ProfileScreen } from './_profile-form';

describe('ProfileScreen', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  it('shows the French profile fields and utilities', async () => {
    await i18n.changeLanguage('fr');
    await render(<ProfileScreen offline={false} onSave={async () => 'ok'} />);
    expect(screen.getByText('Votre profil')).toBeTruthy();
    expect(screen.getByLabelText('Prénom (facultatif)')).toBeTruthy();
    expect(screen.getByLabelText('3 premiers caractères du code postal (ex. B3H)')).toBeTruthy();
    expect(screen.getByTestId('profile-utility')).toHaveTextContent('Je ne sais pas');
    await fireEvent.press(screen.getByTestId('profile-utility'));
    const shown = { includeHiddenElements: true } as const;
    expect(screen.getByTestId('profile-utility-nb_power', shown)).toHaveTextContent('Énergie NB');
    expect(screen.getByTestId('profile-utility-saint_john_energy', shown)).toBeTruthy();
    expect(screen.getByTestId('profile-utility-energie_edmundston', shown)).toBeTruthy();
    expect(screen.getByTestId('profile-utility-perth_andover', shown)).toBeTruthy();
  });

  it('shows the English profile fields and utilities', async () => {
    await i18n.changeLanguage('en');
    await render(<ProfileScreen offline={false} onSave={async () => 'ok'} />);
    expect(screen.getByText('Your profile')).toBeTruthy();
    expect(screen.getByLabelText('First name (optional)')).toBeTruthy();
    expect(screen.getByLabelText('First 3 characters of your postal code (e.g. B3H)')).toBeTruthy();
    expect(screen.getByTestId('profile-utility')).toHaveTextContent("I don't know");
    await fireEvent.press(screen.getByTestId('profile-utility'));
    const shown = { includeHiddenElements: true } as const;
    await fireEvent.press(screen.getByTestId('profile-utility-nb_power', shown));
    expect(screen.getByTestId('profile-utility')).toHaveTextContent('NB Power');
  });

  it('pre-selects the province suggested by the postal code and shows its badge', async () => {
    await i18n.changeLanguage('en');
    await render(<ProfileScreen offline={false} onSave={async () => 'ok'} />);
    await fireEvent.changeText(
      screen.getByLabelText('First 3 characters of your postal code (e.g. B3H)'),
      'B3H',
    );
    expect(screen.getByTestId('profile-province')).toHaveTextContent(/Nova Scotia/);
    expect(screen.getByTestId('profile-coverage-badge')).toHaveTextContent('Fully covered');
    await fireEvent.press(screen.getByTestId('profile-province'));
    const shown = { includeHiddenElements: true } as const;
    await fireEvent.changeText(screen.getByTestId('profile-province-search', shown), 'Ontario');
    await fireEvent.press(screen.getByTestId('profile-province-ON', shown));
    expect(screen.getByTestId('profile-coverage-badge')).toHaveTextContent('Federal programs only');
  });
});
