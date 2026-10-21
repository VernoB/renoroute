import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  allowAnalyticsEvent,
  appOpenedProperties,
  APP_OPENED_EVENT,
  isSensitiveScreen,
  posthogPrivacyOptions,
  scrubSentryEvent,
  sentryPrivacyOptions,
} from './privacy.ts';

test('Sentry privacy options never enable default PII or session replay', () => {
  assert.equal(sentryPrivacyOptions.sendDefaultPii, false);
  assert.equal(sentryPrivacyOptions.replaysSessionSampleRate, 0);
  assert.equal(sentryPrivacyOptions.replaysOnErrorSampleRate, 0);
  assert.equal(posthogPrivacyOptions.captureAppLifecycleEvents, false);
  assert.equal(posthogPrivacyOptions.enableSessionReplay, false);
  assert.equal(posthogPrivacyOptions.disableGeoip, true);
  assert.equal(posthogPrivacyOptions.capturePushNotificationOpened, false);
});

test('isSensitiveScreen matches route segments only', () => {
  assert.equal(isSensitiveScreen('photos'), true);
  assert.equal(isSensitiveScreen('(app)/photos/upload'), true);
  assert.equal(isSensitiveScreen('author'), false);
  assert.equal(isSensitiveScreen(undefined), false);
});

test('allowAnalyticsEvent drops autocapture on sensitive screens and any email', () => {
  assert.equal(
    allowAnalyticsEvent({ event: '$screen', properties: { $screen_name: 'photos' } }),
    false,
  );
  assert.equal(
    allowAnalyticsEvent({ event: '$autocapture', properties: { screen: 'account' } }),
    false,
  );
  assert.equal(
    allowAnalyticsEvent({ event: '$screen', properties: { $screen_name: 'home' } }),
    true,
  );
  assert.equal(
    allowAnalyticsEvent({ event: APP_OPENED_EVENT, properties: { email: 'a@b.ca' } }),
    false,
  );
  assert.equal(allowAnalyticsEvent({ event: APP_OPENED_EVENT, $set: { email: 'a@b.ca' } }), false);
  assert.deepEqual(appOpenedProperties('local'), { app_env: 'local' });
});

test('scrubSentryEvent keeps only an internal user id', () => {
  const scrubbed = scrubSentryEvent({
    user: { id: 'user-1', email: 'a@b.ca', ip_address: '127.0.0.1', username: 'ada' },
  });
  assert.deepEqual(scrubbed.user, { id: 'user-1' });
  assert.deepEqual(scrubSentryEvent({}), {});
  assert.deepEqual(scrubSentryEvent({ user: { email: 'a@b.ca' } }).user, undefined);
});
