-- Unpublished Nova Scotia drafts. Page titles and https URLs only.
-- Amounts, eligibility, French official names, and verified dates are TODO(verify).
-- Nothing here is published. Brown reviews before any is_published = true.

begin;

insert into public.rebate_programs (
  slug, jurisdiction, administrator, name_fr, name_en,
  summary_fr, summary_en, status,
  requires_pre_evaluation, source_url, official_url,
  last_verified_at, is_published, internal_notes
) values
(
  'ns-home-heating-system-rebates',
  'NS',
  'Efficiency Nova Scotia',
  'Home Heating System Rebates',
  'Home Heating System Rebates',
  'TODO(verify) : montants, admissibilité et nom français officiel. Aucune règle copiée.',
  'TODO(verify): amounts, eligibility, and the official French name. No rules copied.',
  'draft',
  false,
  'https://www.efficiencyns.ca/programs-rebates/home-heating-system-rebates',
  'https://www.efficiencyns.ca/programs-rebates/home-heating-system-rebates',
  null,
  false,
  'Title and URL from the public Efficiency Nova Scotia page. Body was not copied. Do not publish until Brown reviews.'
),
(
  'ns-program-rebate-finder',
  'NS',
  'Efficiency Nova Scotia',
  'Find Home Energy Rebates and Programs',
  'Find Home Energy Rebates and Programs',
  'TODO(verify) : index officiel seulement. Aucun montant.',
  'TODO(verify): official index only. No amounts.',
  'draft',
  false,
  'https://www.efficiencyns.ca/program-rebate-finder',
  'https://www.efficiencyns.ca/program-rebate-finder',
  null,
  false,
  'Finder page. Not a single program. Draft marker so Brown can split real programs later.'
)
on conflict (slug) do nothing;

insert into public.energy_prices (fuel, unit, price_cad, province, source_url, verified_at, is_published)
select fuel, 'TODO(verify)', null, 'NS', null, null, false
from (values
  ('electricity'::public.energy_fuel),
  ('heating_oil'::public.energy_fuel),
  ('propane'::public.energy_fuel),
  ('wood_pellets'::public.energy_fuel),
  ('natural_gas'::public.energy_fuel)
) as drafts(fuel)
where not exists (
  select 1 from public.energy_prices existing
  where existing.province = 'NS' and existing.fuel = drafts.fuel and existing.is_published = false
);

commit;
