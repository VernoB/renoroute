import { Stack } from 'expo-router';
import { useReducedMotion } from 'react-native-reanimated';

import { AreaGate } from '@/lib/auth/area-gate';
import { useAuth } from '@/lib/auth/session-provider';

export default function AuthLayout() {
  const auth = useAuth();
  const reduceMotion = useReducedMotion();
  return (
    <AreaGate area="auth" hasSession={auth.hasSession} ready={auth.ready} role={auth.role}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: reduceMotion ? 'fade' : 'slide_from_right',
          animationDuration: reduceMotion ? 120 : 280,
        }}
      />
    </AreaGate>
  );
}
