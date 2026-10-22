import { Redirect } from 'expo-router';

import { devTokensDestination } from '@/features/theme/dev-tokens-route';
import { TokenDemoScreen } from '@/features/theme/token-demo-screen';

export function DevTokensScreen({ enabled = __DEV__ }: { enabled?: boolean }) {
  if (devTokensDestination(enabled) === 'welcome') {
    return <Redirect href="/(auth)/welcome" />;
  }

  return <TokenDemoScreen />;
}

export default function TokensRoute() {
  return <DevTokensScreen />;
}
