-- Admin-edited energy prices. Seed rows stay unpublished.
-- price_cad, unit, and source_url are TODO(verify) by Brown. Do not treat them as NB rates.

create type public.energy_fuel as enum (
  'electricity',
  'heating_oil',
  'propane',
  'wood_pellets',
  'natural_gas'
);

create table public.energy_prices (
  id              uuid primary key default gen_random_uuid(),
  fuel            public.energy_fuel not null,
  unit            text check (unit is null or char_length(unit) <= 40),
  price_cad       numeric(12,4) check (price_cad is null or price_cad >= 0),
  effective_from  date,
  source_url      text check (source_url is null or source_url ~ '^https://'),
  verified_at     timestamptz,
  is_published    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index energy_prices_fuel_effective_from_idx
  on public.energy_prices (fuel, effective_from);

create trigger trg_energy_prices_updated before update on public.energy_prices
  for each row execute function public.set_updated_at();

create trigger trg_audit_energy_prices after insert or update or delete on public.energy_prices
  for each row execute function public.audit_reference_change();

insert into public.energy_prices (fuel, unit, price_cad, effective_from, source_url, verified_at, is_published)
values
  ('electricity', 'TODO(verify)', null, null, null, null, false),
  ('heating_oil', 'TODO(verify)', null, null, null, null, false),
  ('propane', 'TODO(verify)', null, null, null, null, false),
  ('wood_pellets', 'TODO(verify)', null, null, null, null, false),
  ('natural_gas', 'TODO(verify)', null, null, null, null, false);

revoke all on table public.energy_prices from public, anon, authenticated;
grant select, insert, update, delete on table public.energy_prices to authenticated;
grant all on table public.energy_prices to service_role;

alter table public.energy_prices enable row level security;

create policy energy_prices_read on public.energy_prices
  for select to authenticated
  using (is_published or public.is_admin());

create policy energy_prices_admin_write on public.energy_prices
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
