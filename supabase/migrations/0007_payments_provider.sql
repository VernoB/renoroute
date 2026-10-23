-- Hybrid payments (ADR-011): record which store collected the money.
-- plans.unlocked_at stays the only entitlement.

alter table public.payments
  add column provider text not null default 'stripe'
    check (provider in ('stripe', 'revenuecat'));

alter table public.payments
  add column provider_event_id text;

alter table public.payments
  add column revenuecat_event_id text unique;

create unique index payments_provider_event_uidx
  on public.payments (provider, provider_event_id)
  where provider_event_id is not null;

comment on column public.payments.provider is
  'stripe (website Checkout) or revenuecat (iOS/Android IAP).';
comment on column public.payments.provider_event_id is
  'Last verified webhook event id for idempotency.';
comment on column public.payments.revenuecat_event_id is
  'RevenueCat event id when provider = revenuecat.';
