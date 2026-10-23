import { act } from 'react';
import { cleanup, render, screen } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import { ConsentScreen } from './_consent-form';

const save = async () => 'ok' as const;

function pressCheckbox(name: string) {
  const box = screen.getByRole('checkbox', { name });
  const onClick = box.props.onClick as (() => void) | undefined;
  expect(typeof onClick).toBe('function');
  act(() => {
    onClick?.();
  });
}

describe('ConsentScreen', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  it('shows French labels with every checkbox unchecked and Continue disabled', async () => {
    await i18n.changeLanguage('fr');
    await render(<ConsentScreen offline={false} onSave={save} />);
    expect(screen.getByText('Consentements')).toBeTruthy();
    expect(
      screen.getByText(
        "J'accepte les conditions d'utilisation et la politique de confidentialité.",
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "J'accepte le traitement de mes données et de mes photos pour générer un plan.",
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        'Requis pour générer un plan. Le traitement peut avoir lieu hors du Canada, par le fournisseur configuré.',
      ),
    ).toBeTruthy();
    expect(screen.getByText("J'accepte de recevoir des courriels occasionnels.")).toBeTruthy();
    for (const box of screen.getAllByRole('checkbox')) {
      expect(box.props.accessibilityState.checked).toBe(false);
    }
    expect(
      screen.getByRole('button', { name: 'Continuer' }).props.accessibilityState.disabled,
    ).toBe(true);
  });

  it('shows English labels with every checkbox unchecked', async () => {
    await i18n.changeLanguage('en');
    await render(<ConsentScreen offline={false} onSave={save} />);
    expect(screen.getByText('Consents')).toBeTruthy();
    expect(screen.getByText('I accept the terms of use and the privacy policy.')).toBeTruthy();
    expect(
      screen.getByText('I agree to processing of my data and photos to generate a plan.'),
    ).toBeTruthy();
    expect(
      screen.getByText(
        'Required to generate a plan. Processing may happen outside Canada, by the configured provider.',
      ),
    ).toBeTruthy();
    expect(screen.getByText('I agree to occasional emails.')).toBeTruthy();
    expect(screen.getByText('Continue')).toBeTruthy();
    for (const box of screen.getAllByRole('checkbox')) {
      expect(box.props.accessibilityState.checked).toBe(false);
    }
  });

  it('keeps Continue disabled until terms and AI are checked, while marketing stays off', async () => {
    await i18n.changeLanguage('en');
    await render(<ConsentScreen offline={false} onSave={save} />);
    const terms = 'I accept the terms of use and the privacy policy.';
    const ai = 'I agree to processing of my data and photos to generate a plan.';
    const marketing = 'I agree to occasional emails.';

    pressCheckbox(terms);
    expect(screen.getByRole('button', { name: 'Continue' }).props.accessibilityState.disabled).toBe(
      true,
    );

    pressCheckbox(ai);
    expect(screen.getByRole('checkbox', { name: marketing }).props.accessibilityState.checked).toBe(
      false,
    );
    expect(screen.getByRole('button', { name: 'Continue' }).props.accessibilityState.disabled).toBe(
      false,
    );
  });
});
