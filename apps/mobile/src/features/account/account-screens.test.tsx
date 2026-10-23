import { cleanup, fireEvent, render } from '@testing-library/react-native';

import i18n, { i18nReady } from '@/lib/i18n';

import { AccountScreen } from './account-screen';
import { DeleteAccountScreen } from './delete-account-screen';

const copy = {
  fr: {
    title: 'Compte',
    language: 'Langue',
    localeFr: 'Français',
    localeEn: 'English',
    consents: 'Consentements',
    aiOn: 'Traitement IA accepté',
    withdrawAi: 'Retirer le consentement IA',
    marketingOff: 'Courriels refusés',
    toggleMarketing: 'Modifier le consentement marketing',
    export: 'Télécharger mes données',
    delete: 'Supprimer mon compte',
    signOut: 'Se déconnecter',
    privacy: 'Politique de confidentialité',
    terms: "Conditions d'utilisation",
    version: 'Version 0.0.0',
    deleteTitle: 'Supprimer le compte',
    deleteHint:
      'Cela efface vos maisons, photos et plans. Les reçus de paiement sont conservés sans votre nom, pour la comptabilité.',
    deleteKept: 'Conservé : reçus de paiement anonymisés.',
    deleteType: 'Tapez SUPPRIMER pour confirmer.',
    deleteConfirm: 'Supprimer définitivement',
    phrase: 'SUPPRIMER',
  },
  en: {
    title: 'Account',
    language: 'Language',
    localeFr: 'Français',
    localeEn: 'English',
    consents: 'Consents',
    aiOn: 'AI processing accepted',
    withdrawAi: 'Withdraw AI consent',
    marketingOff: 'Emails declined',
    toggleMarketing: 'Change marketing consent',
    export: 'Download my data',
    delete: 'Delete my account',
    signOut: 'Sign out',
    privacy: 'Privacy policy',
    terms: 'Terms of use',
    version: 'Version 0.0.0',
    deleteTitle: 'Delete the account',
    deleteHint:
      'This erases your homes, photos, and plans. Payment receipts are kept without your name, for accounting.',
    deleteKept: 'Kept: anonymized payment receipts.',
    deleteType: 'Type DELETE to confirm.',
    deleteConfirm: 'Delete permanently',
    phrase: 'DELETE',
  },
} as const;

async function renderScreens(
  locale: 'fr' | 'en',
  handlers: {
    onChangeLocale: (next: 'fr' | 'en') => void;
    onConfirm: () => void;
    typed: string;
  },
) {
  await i18nReady;
  await i18n.changeLanguage(locale);
  return render(
    <>
      <AccountScreen
        aiConsented
        exportState="idle"
        locale={locale}
        marketing={false}
        onChangeLocale={handlers.onChangeLocale}
        onDelete={() => undefined}
        onExport={() => undefined}
        onOpenPrivacy={() => undefined}
        onOpenTerms={() => undefined}
        onSignOut={() => undefined}
        onToggleMarketing={() => undefined}
        onWithdrawAi={() => undefined}
        version="0.0.0"
      />
      <DeleteAccountScreen
        error={null}
        locale={locale}
        onChangeTyped={() => undefined}
        onConfirm={handlers.onConfirm}
        pending={false}
        typed={handlers.typed}
      />
    </>,
  );
}

function expectCopy(
  view: Awaited<ReturnType<typeof render>>,
  text: (typeof copy)[keyof typeof copy],
): void {
  expect(view.getAllByText(text.title).length).toBeGreaterThan(0);
  expect(view.getByText(text.language)).toBeTruthy();
  expect(view.getByText(text.localeFr)).toBeTruthy();
  expect(view.getByText(text.localeEn)).toBeTruthy();
  expect(view.getByText(text.consents)).toBeTruthy();
  expect(view.getByText(text.aiOn)).toBeTruthy();
  expect(view.getByText(text.withdrawAi)).toBeTruthy();
  expect(view.getByText(text.marketingOff)).toBeTruthy();
  expect(view.getByText(text.toggleMarketing)).toBeTruthy();
  expect(view.getByText(text.export)).toBeTruthy();
  expect(view.getByText(text.delete)).toBeTruthy();
  expect(view.getByText(text.signOut)).toBeTruthy();
  expect(view.getByText(text.privacy)).toBeTruthy();
  expect(view.getByText(text.terms)).toBeTruthy();
  expect(view.getByText(text.version)).toBeTruthy();
  expect(view.getByText(text.deleteTitle)).toBeTruthy();
  expect(view.getByText(text.deleteHint)).toBeTruthy();
  expect(view.getByText(text.deleteKept)).toBeTruthy();
  expect(view.getByText(text.deleteType)).toBeTruthy();
  expect(view.getByText(text.deleteConfirm)).toBeTruthy();
}

describe('account screens', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  it('shows French account and delete copy and keeps delete disabled until SUPPRIMER', async () => {
    const locales: string[] = [];
    const confirmed: string[] = [];
    const view = await renderScreens('fr', {
      onChangeLocale: (next) => {
        locales.push(next);
      },
      onConfirm: () => {
        confirmed.push('fr');
      },
      typed: '',
    });
    expectCopy(view, copy.fr);
    fireEvent.press(view.getByTestId('account-locale-en'));
    expect(locales).toEqual(['en']);
    expect(view.getByTestId('delete-confirm').props.accessibilityState.disabled).toBe(true);
    fireEvent.press(view.getByTestId('delete-confirm'));
    expect(confirmed).toEqual([]);
  });

  it('shows English account and delete copy and enables delete after DELETE', async () => {
    const confirmed: string[] = [];
    const view = await renderScreens('en', {
      onChangeLocale: () => undefined,
      onConfirm: () => {
        confirmed.push('en');
      },
      typed: 'DELETE',
    });
    expectCopy(view, copy.en);
    expect(view.getByTestId('delete-confirm').props.accessibilityState.disabled).toBe(false);
    fireEvent.press(view.getByTestId('delete-confirm'));
    expect(confirmed).toEqual(['en']);
  });
});
