import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';

import {
  signInWithSocial,
  type SocialProvider,
  type SocialSignInResult,
} from '@/lib/auth/social-sign-in';
import i18n from '@/lib/i18n';

import { SignInScreen } from './_sign-in-form';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

async function press(label: string) {
  await act(async () => {
    fireEvent.press(screen.getByLabelText(label));
  });
}

const idleSocial = async () => ({ ok: true as const });

function renderSignIn(
  platform: string,
  signIn: (provider: SocialProvider) => Promise<SocialSignInResult> = idleSocial,
) {
  return render(
    <SignInScreen
      onCodeSent={() => undefined}
      platform={platform}
      requestCode={async () => undefined}
      signInWithSocial={signIn}
    />,
  );
}

describe('SignInScreen', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  it('asks for an email in French and keeps send disabled until the address is complete', async () => {
    await i18n.changeLanguage('fr');
    await renderSignIn('ios');
    expect(screen.getByLabelText('Courriel')).toBeTruthy();
    expect(screen.getByText('Recevoir un code')).toBeTruthy();
    expect(screen.getByLabelText('Recevoir un code').props.accessibilityState.disabled).toBe(true);
    expect(screen.getByLabelText('Continuer avec Apple').props.accessibilityRole).toBe('button');
    expect(screen.getByLabelText('Continuer avec Google').props.accessibilityRole).toBe('button');
  });

  it('asks for an email in English and offers Apple and Google', async () => {
    await i18n.changeLanguage('en');
    await renderSignIn('ios');
    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByText('Email me a code')).toBeTruthy();
    expect(screen.getByLabelText('Continue with Apple')).toBeTruthy();
    expect(screen.getByLabelText('Continue with Google')).toBeTruthy();
  });

  it('does not show Apple on Android', async () => {
    await i18n.changeLanguage('fr');
    await renderSignIn('android');
    expect(screen.queryByLabelText('Continuer avec Apple')).toBeNull();
    expect(screen.getByLabelText('Continuer avec Google')).toBeTruthy();
  });

  it('shows a translated failure when the provider is missing', async () => {
    await i18n.changeLanguage('fr');
    await renderSignIn('ios', (provider) =>
      signInWithSocial({
        provider,
        platform: 'ios',
        client: null,
        config: { googleWebClientId: 'replace-google-web-client-id' },
        redirectTo: 'renoroute://auth/callback',
        openAuthSession: async () => ({ type: 'success', url: 'renoroute://auth/callback?code=x' }),
      }),
    );
    await press('Continuer avec Google');
    expect(
      await screen.findByText(
        "Cette connexion n'est pas encore disponible. Utilisez votre courriel.",
      ),
    ).toBeTruthy();
    expect(screen.queryByText('Provider google is not enabled')).toBeNull();
    expect(screen.queryByText(/not configured/i)).toBeNull();
  });

  it('shows a translated signing-in label while the provider is pending', async () => {
    await i18n.changeLanguage('en');
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await renderSignIn('ios', async () => {
      await gate;
      return { ok: false, failure: 'cancelled' };
    });
    fireEvent.press(screen.getByLabelText('Continue with Apple'));
    expect(await screen.findByText('Signing in…')).toBeTruthy();
    await act(async () => {
      release();
    });
  });

  it('does not render a thrown English provider error', async () => {
    await i18n.changeLanguage('en');
    await renderSignIn('android', async () => {
      throw new Error('Provider google is not enabled');
    });
    await press('Continue with Google');
    expect(await screen.findByText('Sign-in did not complete. Try again.')).toBeTruthy();
    expect(screen.queryByText('Provider google is not enabled')).toBeNull();
  });
});
