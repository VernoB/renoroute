/** Screens where touch labels or route params can contain income, email, or photos. */
export const SENSITIVE_SCREEN_NAMES = [
  'account',
  'auth',
  'consent',
  'intake',
  'photos',
  'verify',
] as const;

export const APP_OPENED_EVENT = 'app_opened';

export const sentryPrivacyOptions = {
  sendDefaultPii: false,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
} as const;

/** Lifecycle, surveys, replay, push text, and GeoIP stay off. Launch is `app_opened` only. */
export const posthogPrivacyOptions = {
  captureAppLifecycleEvents: false,
  capturePushNotificationOpened: false,
  capturePushNotificationSubscriptions: false,
  disableGeoip: true,
  disableSurveys: true,
  enableSessionReplay: false,
} as const;

const BLOCKED_PROPERTY_KEYS = new Set([
  '$email',
  'address',
  'email',
  'income',
  'phone',
  'photo',
  'postal_code',
  'transcription',
]);

const AUTOCAPTURE_EVENTS = new Set(['$autocapture', '$screen']);

export type AnalyticsEvent = {
  event: string;
  properties?: Record<string, unknown>;
  $set?: Record<string, unknown>;
  $set_once?: Record<string, unknown>;
};

export function isSensitiveScreen(screenName: string | undefined): boolean {
  if (!screenName) {
    return false;
  }
  const names: readonly string[] = SENSITIVE_SCREEN_NAMES;
  return screenName
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((segment) => segment.length > 0)
    .some((segment) => names.includes(segment));
}

export function appOpenedProperties(appEnv: string): { app_env: string } {
  return { app_env: appEnv };
}

export function allowAnalyticsEvent(event: AnalyticsEvent): boolean {
  if (
    hasBlockedProperty(event.properties) ||
    hasBlockedProperty(event.$set) ||
    hasBlockedProperty(event.$set_once)
  ) {
    return false;
  }
  const screen = readScreenName(event.properties);
  return !(isSensitiveScreen(screen) && AUTOCAPTURE_EVENTS.has(event.event));
}

export function scrubSentryEvent<
  T extends {
    user?: {
      id?: string | number;
      email?: string;
      ip_address?: string | null;
      username?: string;
    } | null;
  },
>(event: T): T {
  const user = event.user;
  if (!user?.id) {
    if (!user) {
      return event;
    }
    return { ...event, user: undefined };
  }
  return { ...event, user: { id: user.id } };
}

function readScreenName(properties: Record<string, unknown> | undefined): string | undefined {
  const value = properties?.$screen_name ?? properties?.screen;
  return typeof value === 'string' ? value : undefined;
}

function hasBlockedProperty(properties: Record<string, unknown> | undefined): boolean {
  if (!properties) {
    return false;
  }
  return Object.keys(properties).some((key) => BLOCKED_PROPERTY_KEYS.has(key.toLowerCase()));
}
