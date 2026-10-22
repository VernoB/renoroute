import {
  allowAnalyticsEvent,
  appOpenedProperties,
  APP_OPENED_EVENT,
  posthogPrivacyOptions,
  type AnalyticsEvent,
} from '@renoroute/shared/observability';
import PostHog from 'posthog-react-native';

export function analyticsBeforeSend(event: AnalyticsEvent): AnalyticsEvent | null {
  return allowAnalyticsEvent(event) ? event : null;
}

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY?.trim();
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST?.trim() || 'https://us.i.posthog.com';

export const analytics: PostHog | null = apiKey
  ? new PostHog(apiKey, {
      host,
      ...posthogPrivacyOptions,
      before_send(event) {
        return analyticsBeforeSend(event) ? event : null;
      },
    })
  : null;

let appOpened = false;

export function captureAppOpened(appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? 'local'): void {
  if (!analytics || appOpened) {
    return;
  }
  appOpened = true;
  analytics.capture(APP_OPENED_EVENT, appOpenedProperties(appEnv));
}
