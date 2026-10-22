import { cleanup, render, screen } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import { BeforeAfterCard } from './before-after-card';

describe('BeforeAfterCard', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  it('shows French before and after labels', async () => {
    await i18n.changeLanguage('fr');
    await render(
      <BeforeAfterCard
        afterUri="data:image/png;base64,after"
        beforeUri="data:image/jpeg;base64,before"
      />,
    );
    expect(screen.getByText('Avant')).toBeTruthy();
    expect(screen.getByText('Après')).toBeTruthy();
    expect(screen.getByLabelText("Photo envoyée de la pièce ou de l'équipement")).toBeTruthy();
  });

  it('shows the English fallback when no after image exists', async () => {
    await i18n.changeLanguage('en');
    await render(<BeforeAfterCard afterUri={null} beforeUri="data:image/jpeg;base64,before" />);
    expect(screen.getByText('Before')).toBeTruthy();
    expect(
      screen.getByText(
        'An after image could not be shown for this photo. The plan is still available.',
      ),
    ).toBeTruthy();
    expect(screen.getByText(/Not affiliated with NB Power/)).toBeTruthy();
  });
});
