import { cleanup, render, screen } from '@testing-library/react-native';

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
    expect(screen.getByLabelText('RTA (trois caractères, ex. E1C)')).toBeTruthy();
    expect(screen.getByText('Énergie NB')).toBeTruthy();
    expect(screen.getByText('Saint John Energy')).toBeTruthy();
    expect(screen.getByText('Énergie Edmundston')).toBeTruthy();
    expect(screen.getByText('Perth-Andover')).toBeTruthy();
    expect(screen.getByText('Je ne sais pas')).toBeTruthy();
  });

  it('shows the English profile fields and utilities', async () => {
    await i18n.changeLanguage('en');
    await render(<ProfileScreen offline={false} onSave={async () => 'ok'} />);
    expect(screen.getByText('Your profile')).toBeTruthy();
    expect(screen.getByLabelText('First name (optional)')).toBeTruthy();
    expect(screen.getByLabelText('FSA (three characters, e.g. E1C)')).toBeTruthy();
    expect(screen.getByText('NB Power')).toBeTruthy();
    expect(screen.getByText("I don't know")).toBeTruthy();
  });
});
