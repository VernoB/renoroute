import { Stack } from 'expo-router';

import { AreaGate } from '@/lib/auth/area-gate';
import { useAuth } from '@/lib/auth/session-provider';

export default function AdminLayout() {
  const auth = useAuth();
  return (
    <AreaGate area="admin" hasSession={auth.hasSession} ready={auth.ready} role={auth.role}>
      <Stack screenOptions={{ headerShown: false }} />
    </AreaGate>
  );
}
