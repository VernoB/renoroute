import { AppState, Linking, type AppStateStatus } from 'react-native';

import type { AuthSessionResult } from './social-sign-in';

const CANCEL_AFTER_RETURN_MS = 2500;

type Settle = (result: AuthSessionResult) => void;

/**
 * Opens the provider page in the OS browser and waits for the app redirect.
 * TODO(verify): cancel-versus-success timing has not been tested on a device.
 * Supabase must allow the redirect URL. No client secret is used here.
 */
export function openAuthSession(authUrl: string, redirectTo: string): Promise<AuthSessionResult> {
  const prefix = redirectTo.split('?')[0] ?? redirectTo;
  return new Promise((resolve) => {
    const settle = watchAuthReturn(prefix, resolve);
    Linking.openURL(authUrl).catch(() => settle({ type: 'error' }));
  });
}

function watchAuthReturn(prefix: string, resolve: Settle): Settle {
  let settled = false;
  let leftApp = false;
  let cancelTimer: ReturnType<typeof setTimeout> | undefined;
  const subscriptions: { remove(): void }[] = [];
  const finish: Settle = (result) => {
    if (settled) {
      return;
    }
    settled = true;
    clearTimeout(cancelTimer);
    for (const subscription of subscriptions) {
      subscription.remove();
    }
    resolve(result);
  };
  subscriptions.push(
    urlSubscription(prefix, finish),
    appStateSubscription(
      () => {
        leftApp = true;
      },
      () => {
        if (leftApp && !settled) {
          cancelTimer = setTimeout(() => finish({ type: 'cancel' }), CANCEL_AFTER_RETURN_MS);
        }
      },
    ),
  );
  return finish;
}

function urlSubscription(prefix: string, finish: Settle): { remove(): void } {
  return Linking.addEventListener('url', ({ url }) => {
    if (url.startsWith(prefix)) {
      finish({ type: 'success', url });
    }
  });
}

function appStateSubscription(onLeave: () => void, onReturn: () => void): { remove(): void } {
  return AppState.addEventListener('change', (next) => {
    noteAppState(next, onLeave, onReturn);
  });
}

function noteAppState(next: AppStateStatus, onLeave: () => void, onReturn: () => void): void {
  if (next === 'background' || next === 'inactive') {
    onLeave();
    return;
  }
  if (next === 'active') {
    onReturn();
  }
}
