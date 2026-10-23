import { cleanup, fireEvent, render } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import { AdminBenchmarkList } from './admin-benchmark-list';
import { AdminEnergyPriceList } from './admin-energy-price-list';
import { AdminProgramForm } from './admin-program-form';
import { AdminProgramList } from './admin-program-list';

const locales = ['fr', 'en'] as const;

const copy = {
  fr: {
    programs: 'Programmes de subvention',
    stale: 'À revérifier',
    unpublished: 'Non publié',
    edit: 'Modifier le programme',
    mark: "Marquer vérifié aujourd'hui",
    benchmarks: 'Coûts de référence',
    prices: "Prix de l'énergie",
    electricity: 'Électricité',
    airSealing: "Étanchéisation à l'air",
  },
  en: {
    programs: 'Rebate programs',
    stale: 'Needs re-check',
    unpublished: 'Unpublished',
    edit: 'Edit program',
    mark: 'Mark verified today',
    benchmarks: 'Reference costs',
    prices: 'Energy prices',
    electricity: 'Electricity',
    airSealing: 'Air sealing',
  },
} as const;

describe('admin screens', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  describe.each(locales)('%s', (locale) => {
    it('lists stale unpublished programs without a paywall', async () => {
      await i18n.changeLanguage(locale);
      const opened: string[] = [];
      const view = await render(
        <AdminProgramList
          onOpen={(id) => {
            opened.push(id);
          }}
          rows={[
            {
              id: 'p1',
              nameFr: 'Toute la maison',
              nameEn: 'Total Home',
              status: 'open',
              lastVerifiedAt: '2020-01-01',
              isPublished: false,
            },
          ]}
        />,
      );
      const text = copy[locale];
      expect(view.getByText(text.programs)).toBeTruthy();
      expect(view.getByText(text.stale)).toBeTruthy();
      expect(view.getByText(text.unpublished)).toBeTruthy();
      fireEvent.press(view.getByTestId('admin-program-p1'));
      expect(opened).toEqual(['p1']);
    });

    it('marks a program verified today', async () => {
      await i18n.changeLanguage(locale);
      const marked: string[] = [];
      const view = await render(
        <AdminProgramForm
          isPublished={false}
          lastVerifiedAt="2020-01-01"
          nameEn="Total Home"
          nameFr="Toute la maison"
          onMarkVerified={() => {
            marked.push('yes');
          }}
          onSave={() => undefined}
          rules={[{ id: 'r1', measure: 'air_sealing', amountMinCad: 250, amountMaxCad: 550 }]}
          sourceUrl="https://TODO-verify-official-url"
        />,
      );
      const text = copy[locale];
      expect(view.getByText(text.edit)).toBeTruthy();
      expect(view.getByText(text.airSealing)).toBeTruthy();
      fireEvent.press(view.getByTestId('admin-mark-verified'));
      expect(marked).toEqual(['yes']);
    });

    it('shows unpublished benchmarks and energy prices without a source', async () => {
      await i18n.changeLanguage(locale);
      const text = copy[locale];
      const benchmarks = await render(
        <AdminBenchmarkList
          rows={[
            {
              id: 'b1',
              province: 'CA',
              measure: 'air_sealing',
              lastVerifiedAt: '2020-01-01',
              isActive: false,
            },
          ]}
        />,
      );
      expect(benchmarks.getByText(text.benchmarks)).toBeTruthy();
      expect(benchmarks.getByText(text.unpublished)).toBeTruthy();
      const prices = await render(
        <AdminEnergyPriceList
          rows={[
            {
              id: 'e1',
              fuel: 'electricity',
              unit: 'TODO(verify)',
              sourceUrl: null,
              isPublished: true,
            },
          ]}
        />,
      );
      expect(prices.getByText(text.prices)).toBeTruthy();
      expect(prices.getByText(text.electricity)).toBeTruthy();
      expect(prices.getByText(text.unpublished)).toBeTruthy();
    });
  });
});
