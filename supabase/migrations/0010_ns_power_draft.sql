-- Nova Scotia Power domestic energy charge. Draft until Brown publishes.
-- Figures are copied from docs/research/ns-rebates-research-2026-11-22.md (checked 2026-11-22).
-- Source PDF: https://www.nspower.ca/docs/default-source/regulatory/tariff-book-2026.pdf
-- Energy charge as stated: 18.324 cents/kWh now. The Board order date is not stated, so effective_from stays null.
-- From 2027-01-01 the energy charge as stated is 19.067 cents/kWh.
-- Customer charge on the same pages, not stored in price_cad: $20.08/month now, $21.04/month from 2027-01-01.
-- price_cad holds the sourced cent figures. The calculator expects CAD per kWh, so these rows stay unpublished.
-- TODO(verify): convert to CAD/kWh only when Brown publishes.

begin;

alter type public.electric_utility add value if not exists 'nova_scotia_power';

delete from public.energy_prices
where province = 'NS'
  and fuel = 'electricity'
  and is_published = false
  and price_cad is null
  and source_url is null;

insert into public.energy_prices (
  fuel, unit, price_cad, effective_from, province, source_url, verified_at, is_published
)
select
  'electricity',
  'cents/kWh',
  18.324,
  null,
  'NS',
  'https://www.nspower.ca/docs/default-source/regulatory/tariff-book-2026.pdf',
  '2026-11-22T00:00:00Z',
  false
where not exists (
  select 1
  from public.energy_prices existing
  where existing.province = 'NS'
    and existing.fuel = 'electricity'
    and existing.price_cad = 18.324
    and existing.is_published = false
);

insert into public.energy_prices (
  fuel, unit, price_cad, effective_from, province, source_url, verified_at, is_published
)
select
  'electricity',
  'cents/kWh',
  19.067,
  '2027-01-01',
  'NS',
  'https://www.nspower.ca/docs/default-source/regulatory/tariff-book-2026.pdf',
  '2026-11-22T00:00:00Z',
  false
where not exists (
  select 1
  from public.energy_prices existing
  where existing.province = 'NS'
    and existing.fuel = 'electricity'
    and existing.price_cad = 19.067
    and existing.effective_from = '2027-01-01'
    and existing.is_published = false
);

commit;
