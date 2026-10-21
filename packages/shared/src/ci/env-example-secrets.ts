/** Dummy values gitleaks may ignore. A live key must not match these. */
export const PLACEHOLDER_SECRET_PATTERNS = [
  /replace[-_]?me/,
  /replace-with-[a-z-]+/,
  /never-use-in-apps-folder/,
  /you@example\.com/,
] as const;

const LIVE_STRIPE_KEY = new RegExp('sk_' + 'live_' + '[^\\s#\'"]+', 'g');

export function placeholderCovers(value: string): boolean {
  return PLACEHOLDER_SECRET_PATTERNS.some((pattern) => pattern.test(value));
}

/** Live Stripe secret keys. Placeholders such as sk_test_replace_me are ignored. */
export function liveStripeKeys(text: string): string[] {
  return [...text.matchAll(LIVE_STRIPE_KEY)].map((match) => match[0] ?? '');
}
