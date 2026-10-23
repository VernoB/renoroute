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
    expect(screen.getByText('Une estimation, tout de suite')).toBeTruthy();
    expect(screen.getByTestId('onboarding-step-0')).toBeTruthy();
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
    expect(screen.getByText('An estimate, right away')).toBeTruthy();
    expect(screen.getByLabelText('Turn voice on')).toBeTruthy();
    expect(screen.getByLabelText('Skip')).toBeTruthy();
    expect(screen.getByText('Not affiliated with NB Power')).toBeTruthy();
  });

  it('advances steps and still works when reduce motion is on', async () => {
    await i18n.changeLanguage('fr');
    const onStepChange = jest.fn();
    await renderWelcome({ reduceMotion: true, onStepChange });
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Suivant'));
    });
    expect(screen.getByTestId('onboarding-step-1')).toBeTruthy();
    expect(screen.getByText("Les subventions qui s'appliquent")).toBeTruthy();
    expect(onStepChange).toHaveBeenCalledWith(1);
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Suivant'));
    });
    expect(screen.getByTestId('onboarding-step-2')).toBeTruthy();
    expect(screen.getByText('Un dossier prêt à déposer')).toBeTruthy();
    expect(screen.queryByLabelText('Suivant')).toBeNull();
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
