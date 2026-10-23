import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import { IntakeWizard } from './intake-wizard';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

async function press(label: string) {
  await act(async () => {
    fireEvent.press(screen.getByLabelText(label));
  });
}

describe('IntakeWizard', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  it('shows French home types on step 1', async () => {
    await i18n.changeLanguage('fr');
    await render(<IntakeWizard onChange={() => undefined} />);
    expect(screen.getByTestId('intake-title')).toBeTruthy();
    expect(screen.getByText('Votre maison')).toBeTruthy();
    expect(screen.getByText('1/8')).toBeTruthy();
    expect(screen.getByText('Type de maison')).toBeTruthy();
    expect(screen.getByText('Maison individuelle')).toBeTruthy();
    expect(screen.getByText('Jumelée')).toBeTruthy();
    expect(screen.getByText('En rangée')).toBeTruthy();
    expect(screen.getByText('Maison mobile')).toBeTruthy();
    expect(screen.getByText('Chalet')).toBeTruthy();
    expect(screen.getByText('Duplex')).toBeTruthy();
    expect(screen.getByText('Autre')).toBeTruthy();
    expect(screen.getByText('Suivant')).toBeTruthy();
  });

  it('shows English home types on step 1', async () => {
    await i18n.changeLanguage('en');
    await render(<IntakeWizard onChange={() => undefined} />);
    expect(screen.getByTestId('intake-title')).toBeTruthy();
    expect(screen.getByText('Your home')).toBeTruthy();
    expect(screen.getByText('1/8')).toBeTruthy();
    expect(screen.getByText('Home type')).toBeTruthy();
    expect(screen.getByText('Detached house')).toBeTruthy();
    expect(screen.getByText('Semi-detached')).toBeTruthy();
    expect(screen.getByText('Row house')).toBeTruthy();
    expect(screen.getByText('Mobile home')).toBeTruthy();
    expect(screen.getByText('Cottage')).toBeTruthy();
    expect(screen.getByText('Duplex')).toBeTruthy();
    expect(screen.getByText('Other')).toBeTruthy();
    expect(screen.getByText('Next')).toBeTruthy();
  });

  it('moves forward and back between steps', async () => {
    await i18n.changeLanguage('fr');
    const onChange = jest.fn();
    await render(<IntakeWizard onChange={onChange} />);
    await press('Maison individuelle');
    await press('Suivant');
    expect(screen.getByText('2/8')).toBeTruthy();
    expect(screen.getByText('Année de construction')).toBeTruthy();
    expect(screen.getByText('Retour')).toBeTruthy();
    await press('Retour');
    expect(screen.getByText('1/8')).toBeTruthy();
    expect(screen.getByText('Type de maison')).toBeTruthy();
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)?.[0]).toMatchObject({ homeType: 'detached' });
  });

  it('resumes from initialValues and initialStep', async () => {
    await i18n.changeLanguage('en');
    await render(
      <IntakeWizard
        initialStep={3}
        initialValues={{ electricUtility: 'unknown', floorAreaSqft: 1400, homeType: 'cottage' }}
        onChange={() => undefined}
      />,
    );
    expect(screen.getByText('3/8')).toBeTruthy();
    expect(screen.getByText('Floor area')).toBeTruthy();
    expect(screen.getByDisplayValue('1400')).toBeTruthy();
  });
});
