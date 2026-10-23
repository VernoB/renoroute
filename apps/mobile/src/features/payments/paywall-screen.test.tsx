import { cleanup, fireEvent, render } from '@testing-library/react-native';

import { formatCad } from '@renoroute/shared';

import i18n from '@/lib/i18n';

import { PaywallScreen } from './paywall-screen';

const locales = ['fr', 'en'] as const;

const copy = {
  fr: {
    title: 'Débloquer le plan complet',
    choose: 'Choisissez une offre.',
    included: 'Le plan priorisé, les fourchettes de coûts et la liste des subventions.',
    plan49: 'Plan de rénovation complet',
    plan99: 'Plan de rénovation complet, avec accompagnement',
    payIap: "Acheter dans l'app",
    payWeb: 'Payer de façon sécurisée',
    taxes: 'Taxes en sus. Le taux exact reste à confirmer.',
    refund: 'La politique de remboursement sera affichée avant le paiement réel.',
  },
  en: {
    title: 'Unlock the full plan',
    choose: 'Choose an offer.',
    included: 'The prioritized plan, cost ranges, and the rebate checklist.',
    plan49: 'Full renovation plan',
    plan99: 'Full renovation plan, with extra support',
    payIap: 'Buy in the app',
    payWeb: 'Pay securely',
    taxes: 'Taxes extra. The exact rate is still to be confirmed.',
    refund: 'The refund policy will be shown before a live payment.',
  },
} as const;

describe('PaywallScreen', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  describe.each(locales)('%s', (locale) => {
    it('shows both offers and the IAP action', async () => {
      await i18n.changeLanguage(locale);
      const paid: string[] = [];
      const view = await render(
        <PaywallScreen
          channel="iap"
          onPay={(code) => {
            paid.push(code);
          }}
        />,
      );
      const text = copy[locale];
      expect(view.getByText(text.title)).toBeTruthy();
      expect(view.getByText(text.choose)).toBeTruthy();
      expect(view.getByText(text.included)).toBeTruthy();
      expect(view.getByText(text.plan49)).toBeTruthy();
      expect(view.getByText(text.plan99)).toBeTruthy();
      expect(view.getByText(formatCad(49, locale))).toBeTruthy();
      expect(view.getByText(formatCad(99, locale))).toBeTruthy();
      expect(view.getByText(text.taxes)).toBeTruthy();
      expect(view.getByText(text.refund)).toBeTruthy();
      expect(view.getByRole('button', { name: text.payIap })).toBeTruthy();
      fireEvent.press(view.getByTestId('paywall-pay'));
      expect(paid).toEqual(['renoroute_plan_standard']);
    });

    it('uses the website checkout label on web', async () => {
      await i18n.changeLanguage(locale);
      const view = await render(<PaywallScreen channel="web" onPay={() => undefined} />);
      expect(view.getByRole('button', { name: copy[locale].payWeb })).toBeTruthy();
    });
  });
});
