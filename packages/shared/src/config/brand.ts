// SINGLE SOURCE OF TRUTH for the product name and identifiers.
// Renaming the app = edit this file only (+ store listings / domain outside the repo).
// apps/mobile/app.config.ts, emails, PDFs and i18n interpolation ({{appName}}) import from here.

export const BRAND = {
  name: 'RénoRoute', // display name (FR/EN identical for now) — working name, may change
  slug: 'renoroute', // Expo slug / URL-safe
  scheme: 'renoroute', // deep link scheme: renoroute://
  iosBundleId: 'ca.renoroute.app', // TODO(verify): final reverse-domain once domain is bought
  androidPackage: 'ca.renoroute.app', // TODO(verify)
  supportEmail: 'support@example.com', // TODO(verify): replace with real domain mailbox
  legalEntity: 'TODO(verify)', // e.g. sole proprietorship or NB corporation name
  websiteUrl: 'https://example.com', // TODO(verify)
} as const;

export type Brand = typeof BRAND;
