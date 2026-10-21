import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/lib/i18n';

import { TokenDemoScreen } from './token-demo-screen';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe('TokenDemoScreen', () => {
  it('renders the token gallery', async () => {
    const view = await render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <TokenDemoScreen />
      </SafeAreaProvider>,
    );
    expect(view.toJSON()).toMatchSnapshot();
  });
});
