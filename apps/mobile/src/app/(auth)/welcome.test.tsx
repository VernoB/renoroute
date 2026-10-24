import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import { WelcomeScreen } from './_welcome-form';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function renderWelcome(overrides: Partial<Parameters<typeof WelcomeScreen>[0]> = {}) {
  return render(
    <WelcomeScreen
      onSkip={() => undefined}
      onStart={() => undefined}
      onToggleVoice={() => undefined}
      reduceMotion={false}
      voiceEnabled={false}
      {...overrides}
    />,
  );
}

describe('WelcomeScreen', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  it('shows the French value promise, first step, and a muted voice toggle', async () => {
    await i18n.changeLanguage('fr');
    await renderWelcome();
    expect(
      screen.getByText(
        'Estimation instantanée gratuite pour vos travaux, plus les subventions du N.-B. et fédérales auxquelles vous avez droit — sans commission cachée.',
      ),
    ).toBeTruthy();
    expect(screen.getByText('Rénovez dans le bon ordre. Touchez les bonnes remises.')).toBeTruthy();
    expect(screen.getByText('Décrivez votre maison')).toBeTruthy();
    expect(screen.getByTestId('onboarding-step-0')).toBeTruthy();
    expect(screen.getByTestId('onboarding-motion-full')).toBeTruthy();
    expect(screen.getByLabelText('Activer la voix')).toBeTruthy();
    expect(screen.getByLabelText('Passer')).toBeTruthy();
    expect(screen.getByText('Non affilié à Énergie NB')).toBeTruthy();
  });

  it('shows the English value promise and first step', async () => {
    await i18n.changeLanguage('en');
    await renderWelcome();
    expect(
      screen.getByText(
        'Free instant estimate for your home upgrade + the NB and federal rebates you qualify for, with no hidden commissions.',
      ),
    ).toBeTruthy();
    expect(screen.getByText('Upgrade in the right order. Claim the right rebates.')).toBeTruthy();
    expect(screen.getByText('Describe your home')).toBeTruthy();
    expect(screen.getByLabelText('Turn voice on')).toBeTruthy();
    expect(screen.getByLabelText('Skip')).toBeTruthy();
    expect(screen.getByText('Not affiliated with NB Power')).toBeTruthy();
  });

  it('advances steps and still works when reduce motion is on', async () => {
    await i18n.changeLanguage('fr');
    const onStepChange = jest.fn();
    await renderWelcome({ reduceMotion: true, onStepChange });
    expect(screen.getByTestId('onboarding-motion-reduced')).toBeTruthy();
    expect(screen.queryByTestId('onboarding-motion-full')).toBeNull();
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Suivant'));
    });
    expect(screen.getByTestId('onboarding-step-1')).toBeTruthy();
    expect(screen.getByText('Ajoutez des photos')).toBeTruthy();
    expect(onStepChange).toHaveBeenCalledWith(1);
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Suivant'));
    });
    expect(screen.getByTestId('onboarding-step-2')).toBeTruthy();
    expect(screen.getByText('Recevez votre plan priorisé')).toBeTruthy();
    expect(screen.getByLabelText('Suivant')).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Suivant'));
    });
    expect(screen.getByTestId('onboarding-step-3')).toBeTruthy();
    expect(screen.getByText('Suivez la liste des remises')).toBeTruthy();
    expect(screen.queryByLabelText('Suivant')).toBeNull();
    expect(screen.getByTestId('onboarding-motion-reduced')).toBeTruthy();
  });

  it('animates the language toggle in both motion modes', async () => {
    await i18n.changeLanguage('fr');
    await renderWelcome({ reduceMotion: true });
    expect(screen.getByTestId('locale-fr').props.accessibilityState.selected).toBe(true);
    await act(async () => {
      fireEvent.press(screen.getByTestId('locale-en'));
    });
    expect(screen.getByTestId('locale-en')).toBeTruthy();
  });

  it('calls skip and the voice toggle without starting voice by default', async () => {
    await i18n.changeLanguage('en');
    const onSkip = jest.fn();
    const onToggleVoice = jest.fn();
    await renderWelcome({ onSkip, onToggleVoice, voiceEnabled: false });
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Turn voice on'));
    });
    expect(onToggleVoice).toHaveBeenCalledTimes(1);
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Skip'));
    });
    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});
