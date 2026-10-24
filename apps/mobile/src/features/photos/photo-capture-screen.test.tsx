import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import { PhotoCaptureScreen } from './photo-capture-screen';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('PhotoCaptureScreen', () => {
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('fr');
  });

  it('shows the French heating tip and shutter before a shot', async () => {
    await i18n.changeLanguage('fr');
    await render(
      <PhotoCaptureScreen
        category="heating_equipment"
        onRetake={() => undefined}
        onShutter={() => undefined}
        onUse={() => undefined}
        previewUri={null}
        queued={false}
      />,
    );
    expect(screen.getByTestId('photo-capture')).toBeTruthy();
    expect(screen.getByText('Photographier : Chauffage')).toBeTruthy();
    expect(
      screen.getByText("Photographiez l'étiquette signalétique de la fournaise ou de la thermopompe."),
    ).toBeTruthy();
    expect(screen.getByLabelText('Déclencher')).toBeTruthy();
    expect(screen.queryByLabelText('Utiliser')).toBeNull();
  });

  it('shows the English window tip, preview actions, and a queued notice', async () => {
    await i18n.changeLanguage('en');
    const onRetake = jest.fn();
    const onUse = jest.fn();
    await render(
      <PhotoCaptureScreen
        category="window"
        onRetake={onRetake}
        onShutter={() => undefined}
        onUse={onUse}
        previewUri="file:///tmp/window.jpg"
        queued
      />,
    );
    expect(screen.getByText('Photograph: Windows')).toBeTruthy();
    expect(
      screen.getByText('Photograph the whole window from inside, including the frame, with no faces.'),
    ).toBeTruthy();
    expect(screen.getByText('Offline: the photo will send when you reconnect.')).toBeTruthy();
    expect(screen.getByTestId('photo-preview')).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Retake'));
    });
    expect(onRetake).toHaveBeenCalledTimes(1);
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Use photo'));
    });
    expect(onUse).toHaveBeenCalledTimes(1);
  });
});
