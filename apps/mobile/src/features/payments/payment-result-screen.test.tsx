import { cleanup, fireEvent, render } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import { PaymentResultScreen } from './payment-result-screen';

const locales = ['fr', 'en'] as const;

const copy = {
  fr: {
    waiting: 'Confirmation du paiement…',
    success: 'Plan débloqué',
    failed: "Le paiement n'a pas abouti.",
    cancelled: 'Paiement annulé.',
    retry: 'Réessayer',
  },
  en: {
    waiting: 'Confirming payment…',
    success: 'Plan unlocked',
    failed: 'The payment did not go through.',
    cancelled: 'Payment cancelled.',
    retry: 'Try again',
  },
} as const;

describe('PaymentResultScreen', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  describe.each(locales)('%s', (locale) => {
    it('shows success without a retry action', async () => {
      await i18n.changeLanguage(locale);
      const view = await render(<PaymentResultScreen onRetry={() => undefined} status="success" />);
      expect(view.getByText(copy[locale].success)).toBeTruthy();
      expect(view.queryByRole('button', { name: copy[locale].retry })).toBeNull();
    });

    it('lets the user retry a cancelled payment', async () => {
      await i18n.changeLanguage(locale);
      const retries: string[] = [];
      const view = await render(
        <PaymentResultScreen
          onRetry={() => {
            retries.push('ok');
          }}
          status="cancelled"
        />,
      );
      expect(view.getByText(copy[locale].cancelled)).toBeTruthy();
      fireEvent.press(view.getByRole('button', { name: copy[locale].retry }));
      expect(retries).toEqual(['ok']);
    });
  });
});
