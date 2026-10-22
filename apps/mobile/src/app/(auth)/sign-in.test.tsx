import { cleanup, render, screen } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import { SignInScreen } from './sign-in-form';

describe('SignInScreen', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  it('asks for an email in French and keeps send disabled until the address is complete', async () => {
    await i18n.changeLanguage('fr');
    await render(<SignInScreen onCodeSent={() => undefined} requestCode={async () => undefined} />);
    expect(screen.getByLabelText('Courriel')).toBeTruthy();
    expect(screen.getByText('Recevoir un code')).toBeTruthy();
    expect(screen.getByRole('button').props.accessibilityState.disabled).toBe(true);
  });

  it('asks for an email in English', async () => {
    await i18n.changeLanguage('en');
    await render(<SignInScreen onCodeSent={() => undefined} requestCode={async () => undefined} />);
    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByText('Email me a code')).toBeTruthy();
  });
});
