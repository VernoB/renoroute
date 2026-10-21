import * as Sentry from '@sentry/react-native';
import type { ComponentType } from 'react';

import { scrubSentryEvent, sentryPrivacyOptions } from '@renoroute/shared/observability';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();

export const sentryEnabled = Boolean(dsn);

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.EXPO_PUBLIC_APP_ENV ?? 'local',
    sendDefaultPii: sentryPrivacyOptions.sendDefaultPii,
    replaysSessionSampleRate: sentryPrivacyOptions.replaysSessionSampleRate,
    replaysOnErrorSampleRate: sentryPrivacyOptions.replaysOnErrorSampleRate,
    beforeSend(event) {
      return scrubSentryEvent(event);
    },
  });
}

export function wrapWithSentry<P extends Record<string, unknown>>(
  component: ComponentType<P>,
): ComponentType<P> {
  if (!sentryEnabled) {
    return component;
  }
  return Sentry.wrap(component);
}
