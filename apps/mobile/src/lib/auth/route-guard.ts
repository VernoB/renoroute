export const APP_ROLES = ['homeowner', 'contractor', 'admin'] as const;

export type AppRole = (typeof APP_ROLES)[number];

export type RouteArea = 'auth' | 'app' | 'admin';

export function isAppRole(value: string | null | undefined): value is AppRole {
  return APP_ROLES.some((role) => role === value);
}

export function routeForSession(input: {
  area: RouteArea;
  hasSession: boolean;
  role: AppRole | null;
}): RouteArea {
  if (!input.hasSession) {
    return 'auth';
  }
  if (input.area === 'admin' && input.role !== 'admin') {
    return 'app';
  }
  if (input.area === 'auth') {
    return 'app';
  }
  return input.area;
}
