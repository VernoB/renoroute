/* config.js — THE single configuration spot for the landing page.
 * Brand values MIRROR packages/shared/src/config/brand.ts (rename the app there AND here).
 * Contains NO secrets: the Supabase anon/publishable key is public by design (RLS = insert-only).
 */
window.RR_CONFIG = {
  brand: {
    name: 'RénoRoute',              // working name — mirror of BRAND.name
    nameParts: ['Réno', 'Route'],   // logo wordmark split (second part in primary colour)
    legalEntity: 'Phaneroo Ventures',  // TODO(verify) — kept from the original landing page
  },
  siteUrl: 'https://vernob.github.io/renoroute-landing/', // update when a custom domain is set
  contactEmail: 'hello@example.com', // TODO: replace with a real mailbox before running ads

  // Price test: ?p=49 or ?p=99 (anything else -> defaultPrice)
  prices: ['49', '99'],
  defaultPrice: '49',
  defaultLocale: 'fr', // same default as the app (EXPO_PUBLIC_DEFAULT_LOCALE)

  // ---- Form endpoint -------------------------------------------------------
  // mode: 'auto' picks the first configured option in this order:
  //   1. 'supabase' — POST to <supabaseUrl>/rest/v1/waitlist (table from supabase/migrations/0002_waitlist.sql)
  //   2. 'post'     — POST form-encoded to any endpoint you own (postUrl)
  //   3. 'mailto'   — fallback: opens the visitor's email app pre-filled to contactEmail
  //   4. 'none'     — nothing configured: the page says sign-ups are not open yet (never fakes success)
  form: {
    mode: 'auto',
    supabaseUrl: '',      // e.g. 'https://abcd1234.supabase.co'
    supabaseAnonKey: '',  // public anon / publishable key (NEVER the service_role key)
    postUrl: '',
  },

  // Optional analytics hook (Meta Pixel / Plausible / PostHog) — leave null until added.
  onLead: null, // function ({ price, lang, intent }) {}
};
