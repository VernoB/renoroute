import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/lib/i18n';

import { DevTokensScreen } from './tokens';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe('DevTokensScreen', () => {
  it('shows the gallery while developing', async () => {
    await render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <DevTokensScreen enabled />
      </SafeAreaProvider>,
    );
    expect(screen.getByTestId('app-ready')).toBeTruthy();
  });
});
