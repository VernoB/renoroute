import { render, screen } from '@testing-library/react-native';
import { PostHogProvider } from 'posthog-react-native';
import { View } from 'react-native';

import { analyticsBeforeSend } from './analytics';

const sensitiveScreens = ['intake', 'photos', 'auth'] as const;

describe('PostHog on a sensitive route', () => {
  it('sends no screen or autocapture event from intake, photos, or auth', async () => {
    const sent: string[] = [];
    const client = {
      capture(event: string, properties?: Record<string, unknown>) {
        const allowed = analyticsBeforeSend({ event, properties });
        if (allowed) {
          const screenName = allowed.properties?.$screen_name ?? allowed.properties?.screen;
          sent.push(`${allowed.event}:${String(screenName)}`);
        }
      },
    };

    await render(
      <PostHogProvider
        autocapture={{ captureScreens: true, captureTouches: false }}
        client={client as never}
      >
        <View testID="intake" />
      </PostHogProvider>,
    );

    expect(screen.getByTestId('intake')).toBeTruthy();

    for (const name of sensitiveScreens) {
      client.capture('$screen', { $screen_name: name });
      client.capture('$autocapture', { screen: name });
    }
    client.capture('$screen', { $screen_name: 'home' });

    expect(sent).toEqual(['$screen:home']);
  });
});
