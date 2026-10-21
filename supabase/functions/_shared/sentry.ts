import { scrubSentryEvent, sentryPrivacyOptions } from './privacy.ts';

let started = false;

/** Starts Sentry only when SENTRY_DSN is set in the function secrets. */
export async function initFunctionSentry(): Promise<void> {
  if (started) {
    return;
  }
  const dsn = Deno.env.get('SENTRY_DSN');
  if (!dsn) {
    return;
  }
  started = true;
  const Sentry = await import('@sentry/deno');
  const environment = Deno.env.get('APP_ENV') ?? 'local';
  Sentry.init({
    dsn,
    environment,
    sendDefaultPii: sentryPrivacyOptions.sendDefaultPii,
    beforeSend(event: {
      user?: {
        id?: string | number;
        email?: string;
        ip_address?: string | null;
        username?: string;
      } | null;
    }) {
      return scrubSentryEvent(event);
    },
  });
}
