import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import { routeForSession, type AppRole, type RouteArea } from './route-guard';

const hrefFor = {
  auth: '/(auth)/welcome',
  app: '/(app)/home',
  admin: '/(admin)',
} as const;

export function AreaGate({
  area,
  hasSession,
  role,
  ready,
  children,
}: {
  area: RouteArea;
  hasSession: boolean;
  role: AppRole | null;
  ready: boolean;
  children: ReactNode;
}) {
  if (!ready) {
    return null;
  }
  const next = routeForSession({ area, hasSession, role });
  if (next !== area) {
    return <Redirect href={hrefFor[next]} />;
  }
  return children;
}
