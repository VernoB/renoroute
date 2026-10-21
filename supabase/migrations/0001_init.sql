-- 0001_init.sql — RénoRoute initial schema
-- Spec: docs/03-database.md. Never edit this file after merge; add 0002_*.sql instead.
-- Conventions: snake_case, uuid PKs (gen_random_uuid), timestamptz, RLS on every table,
-- client writes limited by column-level GRANTs; privileged writes via Edge Functions (service_role).

begin;

create extension if not exists pgcrypto;

-- =========================================================================
-- Enums
-- =========================================================================
create type public.user_role         as enum ('homeowner', 'contractor', 'admin');
create type public.app_locale        as enum ('fr', 'en');
create type public.home_type         as enum ('detached', 'semi_detached', 'row_house', 'mobile_home', 'cottage', 'duplex', 'other');
create type public.heating_system    as enum ('electric_baseboard', 'electric_furnace', 'oil_furnace', 'oil_boiler', 'propane', 'natural_gas', 'wood_stove', 'pellet_stove', 'mini_split_heat_pump', 'central_heat_pump', 'geothermal', 'other', 'unknown');
create type public.electric_utility  as enum ('nb_power', 'saint_john_energy', 'energie_edmundston', 'perth_andover', 'other', 'unknown');
create type public.income_band       as enum ('under_70k', 'from_70k_to_100k', 'from_100k_to_150k', 'over_150k', 'prefer_not_to_say');
create type public.photo_category    as enum ('exterior', 'window', 'door', 'attic', 'basement', 'heating_equipment', 'water_heater', 'electrical_panel', 'energy_bill', 'room', 'other');
create type public.assessment_status as enum ('draft', 'submitted', 'processing', 'completed', 'failed');
create type public.plan_status       as enum ('preview', 'unlocked', 'archived');
create type public.measure_code      as enum ('pre_evaluation', 'air_sealing', 'attic_insulation', 'wall_insulation', 'basement_insulation', 'windows', 'doors', 'mini_split_heat_pump', 'central_heat_pump', 'heat_pump_water_heater', 'smart_thermostat', 'ventilation_hrv', 'solar_pv', 'other');
create type public.item_status       as enum ('todo', 'in_progress', 'done', 'skipped');
create type public.program_status    as enum ('open', 'waitlist', 'full', 'announced', 'paused', 'closed');
create type public.amount_type       as enum ('fixed', 'per_unit', 'range', 'percent', 'loan', 'financing', 'rental', 'fee');
create type public.contractor_status as enum ('pending', 'vetted', 'suspended');
create type public.lead_status       as enum ('requested', 'sent', 'accepted', 'declined', 'won', 'lost', 'cancelled');
create type public.payment_status    as enum ('pending', 'succeeded', 'failed', 'refunded');

-- =========================================================================
-- Helpers
-- =========================================================================
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- =========================================================================
-- profiles (1:1 with auth.users)
-- =========================================================================
create table public.profiles (
  id                      uuid primary key references auth.users(id) on delete cascade,
  role                    public.user_role not null default 'homeowner',
  full_name               text check (char_length(full_name) <= 120),
  preferred_locale        public.app_locale not null default 'fr',
  phone                   text check (char_length(phone) <= 30),
  postal_code_fsa         text check (postal_code_fsa ~ '^[A-Za-z][0-9][A-Za-z]$'), -- first 3 chars only (minimisation)
  consent_terms_version   text,
  consent_terms_at        timestamptz,
  consent_ai_at           timestamptz,       -- explicit consent to AI processing (incl. cross-border)
  consent_marketing       boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- is_admin(): SECURITY DEFINER to avoid RLS recursion on profiles
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Auto-create profile on sign-up
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, preferred_locale)
  values (new.id, coalesce((new.raw_user_meta_data->>'locale')::public.app_locale, 'fr'));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================================
-- homes
-- =========================================================================
create table public.homes (
  id                       uuid primary key default gen_random_uuid(),
  owner_id                 uuid not null references public.profiles(id) on delete cascade,
  label                    text not null default 'Home' check (char_length(label) <= 80),
  province                 text not null default 'NB' check (province in ('NB','NS','PE','NL','QC')),
  postal_code_fsa          text check (postal_code_fsa ~ '^[A-Za-z][0-9][A-Za-z]$'),
  municipality             text check (char_length(municipality) <= 80),
  year_built               int check (year_built between 1700 and 2100),
  home_type                public.home_type,
  storeys                  numeric(3,1) check (storeys between 0.5 and 5),
  floor_area_sqft          int check (floor_area_sqft between 100 and 20000),
  has_basement             boolean,
  heating_primary          public.heating_system not null default 'unknown',
  heating_secondary        public.heating_system,
  water_heater             text check (char_length(water_heater) <= 60),
  electric_utility         public.electric_utility not null default 'unknown',
  annual_electricity_kwh   int check (annual_electricity_kwh between 0 and 200000),
  annual_energy_cost_cad   numeric(10,2) check (annual_energy_cost_cad between 0 and 100000),
  annual_oil_litres        int check (annual_oil_litres between 0 and 20000),
  occupants                int check (occupants between 1 and 20),
  household_income_band    public.income_band,      -- sensitive: optional, used only for eligibility
  owner_occupied           boolean,
  notes                    text check (char_length(notes) <= 2000), -- untrusted user text (prompt-injection aware)
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index on public.homes(owner_id);
create trigger trg_homes_updated before update on public.homes
  for each row execute function public.set_updated_at();

-- =========================================================================
-- home_photos
-- =========================================================================
create table public.home_photos (
  id                 uuid primary key default gen_random_uuid(),
  home_id            uuid not null references public.homes(id) on delete cascade,
  owner_id           uuid not null references public.profiles(id) on delete cascade,
  category           public.photo_category not null,
  storage_path       text not null unique, -- '{owner_id}/{home_id}/{uuid}.jpg' in bucket home-photos
  width              int,
  height             int,
  bytes              int check (bytes <= 5 * 1024 * 1024),
  exif_stripped      boolean not null default false, -- set true by analyze-photo after server check
  ai_observations    jsonb,                          -- validated PhotoObservation (Zod)
  ai_analyzed_at     timestamptz,
  created_at         timestamptz not null default now(),
  constraint photo_path_owner check (split_part(storage_path, '/', 1) = owner_id::text)
);
create index on public.home_photos(home_id);

-- =========================================================================
-- assessments (one AI run request)
-- =========================================================================
create table public.assessments (
  id                 uuid primary key default gen_random_uuid(),
  home_id            uuid not null references public.homes(id) on delete cascade,
  owner_id           uuid not null references public.profiles(id) on delete cascade,
  status             public.assessment_status not null default 'draft',
  locale             public.app_locale not null default 'fr',
  input_snapshot     jsonb,          -- frozen copy of home + photo observations used (server-written)
  voice_note_path    text,           -- bucket voice-notes, optional
  transcript         text check (char_length(transcript) <= 10000),
  model_info         jsonb,          -- {provider, model, prompt_version}
  ai_cost_usd        numeric(8,4),
  error_code         text,
  created_at         timestamptz not null default now(),
  submitted_at       timestamptz,
  completed_at       timestamptz
);
create index on public.assessments(owner_id, created_at desc);

-- =========================================================================
-- Reference data: rebate_programs, rebate_rules, measure_benchmarks (admin-editable)
-- =========================================================================
create table public.rebate_programs (
  id                        uuid primary key default gen_random_uuid(),
  slug                      text not null unique check (slug ~ '^[a-z0-9-]+$'),
  jurisdiction              text not null default 'NB', -- 'NB', 'CA' (federal), 'NB-SJ' (Saint John), later 'QC', 'NS'…
  administrator             text not null,              -- e.g. 'NB Power', 'Government of Canada', 'Saint John Energy'
  name_fr                   text not null,
  name_en                   text not null,
  summary_fr                text,
  summary_en                text,
  status                    public.program_status not null,
  requires_pre_evaluation   boolean not null default false,
  pre_evaluation_fee_cad    numeric(10,2),
  pre_evaluation_fee_note   text,                       -- e.g. '+HST'
  completion_window_months  int,
  income_max_cad            int,
  waitlist_note_fr          text,
  waitlist_note_en          text,
  applies_to_utilities      public.electric_utility[],  -- null = any
  official_url              text,
  source_url                text not null check (source_url ~ '^https://'),
  last_verified_at          date not null,
  verified_by               uuid references public.profiles(id),
  opens_on                  date,
  closes_on                 date,
  is_published              boolean not null default false, -- only published programs are visible / used by AI
  internal_notes            text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);
create trigger trg_rebate_programs_updated before update on public.rebate_programs
  for each row execute function public.set_updated_at();

create table public.rebate_rules (
  id                     uuid primary key default gen_random_uuid(),
  program_id             uuid not null references public.rebate_programs(id) on delete cascade,
  measure                public.measure_code not null,
  amount_type            public.amount_type not null,
  amount_min_cad         numeric(10,2),
  amount_max_cad         numeric(10,2),
  unit_label_fr          text,       -- 'par fenêtre'
  unit_label_en          text,       -- 'per window'
  max_units              int,
  conditions             jsonb not null default '{}'::jsonb, -- machine-readable, validated by Zod RebateConditions
  eligibility_notes_fr   text,
  eligibility_notes_en   text,
  source_url             text not null check (source_url ~ '^https://'),
  last_verified_at       date not null,
  is_active              boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  constraint amount_order check (amount_min_cad is null or amount_max_cad is null or amount_min_cad <= amount_max_cad)
);
create index on public.rebate_rules(program_id);
create trigger trg_rebate_rules_updated before update on public.rebate_rules
  for each row execute function public.set_updated_at();

create table public.measure_benchmarks (
  id                  uuid primary key default gen_random_uuid(),
  province            text not null default 'NB',
  measure             public.measure_code not null,
  cost_low_cad        numeric(10,2) not null,
  cost_high_cad       numeric(10,2) not null,
  cost_unit           text not null default 'project', -- 'project', 'window', 'sqft'
  savings_pct_low     numeric(5,2),  -- % of heating energy, range
  savings_pct_high    numeric(5,2),
  assumptions         jsonb not null default '{}'::jsonb,
  source_url          text not null check (source_url ~ '^https://'),
  last_verified_at    date not null,
  is_active           boolean not null default true,
  updated_at          timestamptz not null default now(),
  unique (province, measure, cost_unit),
  check (cost_low_cad <= cost_high_cad)
);
create trigger trg_measure_benchmarks_updated before update on public.measure_benchmarks
  for each row execute function public.set_updated_at();

-- =========================================================================
-- plans + plan_items
-- =========================================================================
create table public.plans (
  id                       uuid primary key default gen_random_uuid(),
  assessment_id            uuid not null unique references public.assessments(id) on delete cascade,
  home_id                  uuid not null references public.homes(id) on delete cascade,
  owner_id                 uuid not null references public.profiles(id) on delete cascade,
  status                   public.plan_status not null default 'preview',
  locale                   public.app_locale not null,
  summary_fr               text,
  summary_en               text,
  total_cost_low_cad       numeric(12,2),
  total_cost_high_cad      numeric(12,2),
  annual_savings_low_cad   numeric(10,2),
  annual_savings_high_cad  numeric(10,2),
  rebates_low_cad          numeric(10,2),
  rebates_high_cad         numeric(10,2),
  content                  jsonb not null,   -- full validated PlanOutput (Zod), versioned by schema_version
  schema_version           int not null default 1,
  rebate_snapshot          jsonb not null,   -- programs/rules (+ last_verified_at) used at generation time
  disclaimer_version       text not null,
  product_code             text,             -- 'plan_49' | 'plan_99' once paid
  unlocked_at              timestamptz,
  created_at               timestamptz not null default now()
);
create index on public.plans(owner_id, created_at desc);

create table public.plan_items (
  id                       uuid primary key default gen_random_uuid(),
  plan_id                  uuid not null references public.plans(id) on delete cascade,
  owner_id                 uuid not null references public.profiles(id) on delete cascade,
  priority                 int not null check (priority between 1 and 50),
  measure                  public.measure_code not null,
  title_fr                 text not null,
  title_en                 text not null,
  rationale_fr             text,
  rationale_en             text,
  cost_low_cad             numeric(10,2),
  cost_high_cad            numeric(10,2),
  savings_low_cad          numeric(10,2),
  savings_high_cad         numeric(10,2),
  savings_kwh_low          int,
  savings_kwh_high         int,
  matched_rebates          jsonb not null default '[]'::jsonb, -- [{program_id, rule_id, amount_min, amount_max, status}]
  confidence               text check (confidence in ('low','medium','high')),
  status                   public.item_status not null default 'todo', -- checklist (user-updatable)
  status_updated_at        timestamptz,
  created_at               timestamptz not null default now(),
  unique (plan_id, priority)
);
create index on public.plan_items(plan_id);

-- =========================================================================
-- contractors + leads (tables in MVP, features in V2)
-- =========================================================================
create table public.contractors (
  id                     uuid primary key default gen_random_uuid(),
  profile_id             uuid unique references public.profiles(id) on delete set null,
  business_name          text not null,
  contact_email          text not null,
  contact_phone          text,
  website_url            text,
  service_fsas           text[] not null default '{}',   -- FSAs served
  measures               public.measure_code[] not null default '{}',
  languages              public.app_locale[] not null default '{fr,en}',
  insurance_verified_at  date,
  licence_notes          text,
  status                 public.contractor_status not null default 'pending',
  subscription_status    text,           -- V2: 'none'|'active'|'past_due'
  stripe_customer_id     text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create trigger trg_contractors_updated before update on public.contractors
  for each row execute function public.set_updated_at();

create table public.leads (
  id                     uuid primary key default gen_random_uuid(),
  plan_id                uuid not null references public.plans(id) on delete cascade,
  homeowner_id           uuid not null references public.profiles(id) on delete cascade,
  contractor_id          uuid references public.contractors(id) on delete set null,
  plan_item_ids          uuid[] not null default '{}',
  status                 public.lead_status not null default 'requested',
  consent_share_at       timestamptz not null,  -- homeowner explicitly consented to share contact + plan excerpt
  shared_payload         jsonb,                 -- exact minimal data shared with contractor
  referral_fee_cad       numeric(10,2),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index on public.leads(homeowner_id);
create index on public.leads(contractor_id);
create trigger trg_leads_updated before update on public.leads
  for each row execute function public.set_updated_at();

-- =========================================================================
-- payments
-- =========================================================================
create table public.payments (
  id                          uuid primary key default gen_random_uuid(),
  owner_id                    uuid references public.profiles(id) on delete set null, -- null after account deletion (record kept for tax)
  plan_id                     uuid references public.plans(id) on delete set null,
  product_code                text not null,      -- 'plan_49' | 'plan_99'
  amount_cents                int not null check (amount_cents >= 0),
  tax_cents                   int not null default 0,
  currency                    text not null default 'cad' check (currency = 'cad'),
  status                      public.payment_status not null default 'pending',
  stripe_checkout_session_id  text unique,
  stripe_payment_intent_id    text unique,
  stripe_event_last_id        text,               -- idempotency for webhooks
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);
create index on public.payments(owner_id);
create trigger trg_payments_updated before update on public.payments
  for each row execute function public.set_updated_at();
-- NOTE: on account deletion, payments rows are kept (tax/accounting retention — duration TODO(verify) with accountant)
-- with owner_id set to null; they contain no PII beyond Stripe ids.

-- =========================================================================
-- audit_log (append-only, server-written)
-- =========================================================================
create table public.audit_log (
  id           bigint generated always as identity primary key,
  actor_id     uuid,                  -- null = system
  action       text not null,         -- 'plan.generate', 'rebate_program.update', 'account.delete', …
  entity       text,
  entity_id    text,
  metadata     jsonb not null default '{}'::jsonb,  -- NO PII, no photo/transcript content
  created_at   timestamptz not null default now()
);
create index on public.audit_log(actor_id, action, created_at desc);

-- Rate limit helper (used by Edge Functions with service role): count recent actions
create or replace function public.recent_action_count(p_actor uuid, p_action text, p_window interval)
returns int language sql stable security definer set search_path = public as $$
  select count(*)::int from public.audit_log
  where actor_id = p_actor and action = p_action and created_at > now() - p_window;
$$;
revoke all on function public.recent_action_count(uuid, text, interval) from public, anon, authenticated;

-- Audit trigger for reference data changes
create or replace function public.audit_reference_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_log(actor_id, action, entity, entity_id, metadata)
  values (auth.uid(), tg_table_name || '.' || lower(tg_op), tg_table_name,
          (case when tg_op = 'DELETE' then old.id else new.id end)::text,
          jsonb_build_object('op', tg_op));
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;
create trigger trg_audit_rebate_programs after insert or update or delete on public.rebate_programs
  for each row execute function public.audit_reference_change();
create trigger trg_audit_rebate_rules after insert or update or delete on public.rebate_rules
  for each row execute function public.audit_reference_change();
create trigger trg_audit_measure_benchmarks after insert or update or delete on public.measure_benchmarks
  for each row execute function public.audit_reference_change();

-- =========================================================================
-- Privileges: start from zero, grant minimal
-- =========================================================================
revoke all on all tables in schema public from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, preferred_locale, phone, postal_code_fsa,
              consent_terms_version, consent_terms_at, consent_ai_at, consent_marketing)
  on public.profiles to authenticated;            -- role is NOT updatable by clients

grant select, insert, update, delete on public.homes to authenticated;
grant select, insert, delete on public.home_photos to authenticated;
grant update (category) on public.home_photos to authenticated;
grant select, insert on public.assessments to authenticated;
grant update (voice_note_path, locale) on public.assessments to authenticated;
grant select on public.plans to authenticated;
grant select on public.plan_items to authenticated;
grant update (status, status_updated_at) on public.plan_items to authenticated; -- checklist only
grant select on public.payments to authenticated;
grant select on public.leads to authenticated;
grant select on public.contractors to authenticated;
grant select on public.audit_log to authenticated;  -- RLS restricts to admin

grant select on public.rebate_programs, public.rebate_rules, public.measure_benchmarks to anon, authenticated;
grant insert, update, delete on public.rebate_programs, public.rebate_rules, public.measure_benchmarks to authenticated; -- RLS: admin only
grant insert, update, delete on public.contractors to authenticated; -- RLS: admin only (V2: contractor self-update via function)

-- =========================================================================
-- Row Level Security
-- =========================================================================
alter table public.profiles           enable row level security;
alter table public.homes              enable row level security;
alter table public.home_photos        enable row level security;
alter table public.assessments        enable row level security;
alter table public.plans              enable row level security;
alter table public.plan_items         enable row level security;
alter table public.rebate_programs    enable row level security;
alter table public.rebate_rules       enable row level security;
alter table public.measure_benchmarks enable row level security;
alter table public.contractors        enable row level security;
alter table public.leads              enable row level security;
alter table public.payments           enable row level security;
alter table public.audit_log          enable row level security;

-- profiles
create policy profiles_select_own on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- homes
create policy homes_owner_all on public.homes for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy homes_admin_select on public.homes for select to authenticated using (public.is_admin());

-- home_photos (owner must also own the home)
create policy photos_owner_select on public.home_photos for select to authenticated
  using (owner_id = (select auth.uid()));
create policy photos_owner_insert on public.home_photos for insert to authenticated
  with check (owner_id = (select auth.uid())
              and exists (select 1 from public.homes h where h.id = home_id and h.owner_id = (select auth.uid())));
create policy photos_owner_update on public.home_photos for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy photos_owner_delete on public.home_photos for delete to authenticated
  using (owner_id = (select auth.uid()));

-- assessments
create policy assessments_owner_select on public.assessments for select to authenticated
  using (owner_id = (select auth.uid()));
create policy assessments_owner_insert on public.assessments for insert to authenticated
  with check (owner_id = (select auth.uid()) and status = 'draft'
              and exists (select 1 from public.homes h where h.id = home_id and h.owner_id = (select auth.uid())));
create policy assessments_owner_update on public.assessments for update to authenticated
  using (owner_id = (select auth.uid()) and status = 'draft') with check (owner_id = (select auth.uid()));

-- plans (read-only for owner; written by generate-plan / stripe-webhook with service role)
create policy plans_owner_select on public.plans for select to authenticated
  using (owner_id = (select auth.uid()) or public.is_admin());

-- plan_items: preview shows only top 2 priorities until the plan is unlocked
create policy plan_items_owner_select on public.plan_items for select to authenticated
  using (
    public.is_admin() or (
      owner_id = (select auth.uid())
      and (priority <= 2 or exists (select 1 from public.plans p
                                     where p.id = plan_id and p.unlocked_at is not null))
    )
  );
create policy plan_items_owner_update on public.plan_items for update to authenticated
  using (owner_id = (select auth.uid())
         and exists (select 1 from public.plans p where p.id = plan_id and p.unlocked_at is not null))
  with check (owner_id = (select auth.uid()));
-- NOTE: plans.content (full JSON) must not leak locked items: generate-plan stores locked details only
-- in plan_items; plans.content for preview contains summary + top-2 only, and is rewritten on unlock.

-- reference data: everyone reads published/active; admin writes
create policy rebate_programs_read on public.rebate_programs for select to anon, authenticated
  using (is_published or public.is_admin());
create policy rebate_programs_admin_write on public.rebate_programs for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy rebate_rules_read on public.rebate_rules for select to anon, authenticated
  using ((is_active and exists (select 1 from public.rebate_programs rp where rp.id = program_id and rp.is_published))
         or public.is_admin());
create policy rebate_rules_admin_write on public.rebate_rules for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy measure_benchmarks_read on public.measure_benchmarks for select to anon, authenticated
  using (is_active or public.is_admin());
create policy measure_benchmarks_admin_write on public.measure_benchmarks for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- contractors: admin manages; contractor reads own row (V2); homeowners see vetted contractors only via leads (V2 function)
create policy contractors_admin_all on public.contractors for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy contractors_self_select on public.contractors for select to authenticated
  using (profile_id = (select auth.uid()));

-- leads: homeowner reads own; contractor reads leads assigned to them; writes via Edge Function
create policy leads_homeowner_select on public.leads for select to authenticated
  using (homeowner_id = (select auth.uid()) or public.is_admin());
create policy leads_contractor_select on public.leads for select to authenticated
  using (exists (select 1 from public.contractors c
                 where c.id = contractor_id and c.profile_id = (select auth.uid()) and c.status = 'vetted'));

-- payments: owner reads own; written only by stripe-webhook (service role)
create policy payments_owner_select on public.payments for select to authenticated
  using (owner_id = (select auth.uid()) or public.is_admin());

-- audit_log: admin read only; inserts by service role / SECURITY DEFINER triggers
create policy audit_admin_select on public.audit_log for select to authenticated
  using (public.is_admin());

-- =========================================================================
-- Storage: private buckets + path-based policies ({uid}/{home_id}/{file})
-- =========================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('home-photos', 'home-photos', false, 5242880, array['image/jpeg','image/png','image/webp']),
       ('voice-notes', 'voice-notes', false, 10485760, array['audio/m4a','audio/mp4','audio/aac','audio/mpeg','audio/webm'])
on conflict (id) do nothing;
-- TODO(verify): exact audio MIME types produced by expo-audio on iOS/Android.

create policy storage_owner_select on storage.objects for select to authenticated
  using (bucket_id in ('home-photos','voice-notes') and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy storage_owner_insert on storage.objects for insert to authenticated
  with check (bucket_id in ('home-photos','voice-notes') and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy storage_owner_delete on storage.objects for delete to authenticated
  using (bucket_id in ('home-photos','voice-notes') and (storage.foldername(name))[1] = (select auth.uid())::text);
-- No UPDATE policy: files are immutable (re-upload = new object).

commit;
