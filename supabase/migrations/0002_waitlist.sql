-- 0002_waitlist.sql — Landing page waitlist / reservation capture (validation phase).
-- Spec: apps/landing/README.md + docs/03-database.md §4.14.
-- Public (anon) can INSERT only. Nobody can read through the API except admins. No update/delete from clients.

begin;

create table public.waitlist (
  id                    uuid primary key default gen_random_uuid(),
  email                 text not null check (char_length(email) between 5 and 254 and email ~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'),
  town                  text check (char_length(town) <= 80),
  heat                  text check (heat in ('baseboard','oil','heatpump','wood','other')),
  intent                text not null check (intent in ('reserve','waitlist')),
  locale                public.app_locale not null default 'fr',
  price_variant         int not null check (price_variant in (49, 99)),
  utm_source            text check (char_length(utm_source) <= 100),
  utm_campaign          text check (char_length(utm_campaign) <= 100),
  utm_content           text check (char_length(utm_content) <= 100),
  consent_marketing     boolean not null check (consent_marketing),   -- CASL: express consent required to insert
  consent_text_version  text not null check (char_length(consent_text_version) <= 40),
  created_at            timestamptz not null default now(),
  unsubscribed_at       timestamptz,
  converted_profile_id  uuid references public.profiles(id) on delete set null
);
-- One row per email (case-insensitive). Duplicate insert -> HTTP 409, which the landing treats as success.
create unique index waitlist_email_unique on public.waitlist (lower(email));
create index on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;

revoke all on public.waitlist from anon, authenticated;
grant insert (email, town, heat, intent, locale, price_variant, utm_source, utm_campaign, utm_content,
              consent_marketing, consent_text_version)
  on public.waitlist to anon, authenticated;            -- column-level: cannot set created_at, ids, conversion
grant select, update, delete on public.waitlist to authenticated; -- RLS restricts to admin

create policy waitlist_public_insert on public.waitlist for insert to anon, authenticated
  with check (consent_marketing is true);
create policy waitlist_admin_select on public.waitlist for select to authenticated using (public.is_admin());
create policy waitlist_admin_update on public.waitlist for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy waitlist_admin_delete on public.waitlist for delete to authenticated using (public.is_admin());

-- NOTE (abuse): anon insert-only endpoints can be spammed. Mitigations: honeypot field in the form,
-- DB checks above, Supabase API rate limits, and if needed a later Edge Function with Turnstile/hCaptcha.

commit;
