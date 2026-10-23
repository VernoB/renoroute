-- Dev seed for rebate_programs. Values = docs/03-database.md §8.
-- is_published = false until Brown pastes official source_url (M5-04).
-- Do not invent official URLs. Placeholder must stay https://TODO-verify-official-url.

insert into public.rebate_programs (
  slug, jurisdiction, administrator, name_fr, name_en, status,
  requires_pre_evaluation, pre_evaluation_fee_cad, pre_evaluation_fee_note,
  completion_window_months, income_max_cad, applies_to_utilities,
  source_url, last_verified_at, is_published, internal_notes
) values
(
  'nbp-total-home-energy-savings', 'NB', 'NB Power',
  'Programme d''économies d''énergie pour toute la maison',
  'Total Home Energy Savings Program',
  'open', true, 99.00, '+HST', 9, null, null,
  'https://TODO-verify-official-url', '2026-10-19', false,
  'Amounts from 03-database.md §8. TODO(verify) official FR name and fees.'
),
(
  'nbp-enhanced-energy-savings', 'NB', 'NB Power',
  'Programme d''économies d''énergie bonifié',
  'Enhanced Energy Savings Program',
  'waitlist', true, null, null, null, 70000, null,
  'https://TODO-verify-official-url', '2026-10-19', false,
  'Households ≤ 70 000 $. Waitlist ~2 years. TODO(verify).'
),
(
  'ca-greener-homes-loan', 'CA', 'Government of Canada',
  'Prêt pour les maisons plus vertes',
  'Greener Homes Loan',
  'closed', false, null, null, null, null, null,
  'https://TODO-verify-official-url', '2026-10-19', false,
  'Closed 1 Oct 2025. Keep for history. Do not publish.'
),
(
  'ca-national-heat-pump-rebate', 'CA', 'Government of Canada',
  'Remise fédérale pour thermopompes',
  'National heat-pump rebate',
  'announced', false, null, null, null, null, null,
  'https://TODO-verify-official-url', '2026-10-19', false,
  'Announced 8 Oct 2026; launch early 2027. Detailed rules not published. TODO(verify).'
),
(
  'sje-heat-pump-rental-financing', 'NB-SJ', 'Saint John Energy',
  'Location et financement de thermopompes',
  'Heat-pump rental and financing',
  'open', false, null, null, null, null,
  array['saint_john_energy']::public.electric_utility[],
  'https://TODO-verify-official-url', '2026-10-19', false,
  'SJE customers only. Financing up to 10 000 $. TODO(verify).'
);

insert into public.rebate_rules (
  program_id, measure, amount_type, amount_min_cad, amount_max_cad,
  unit_label_fr, unit_label_en, conditions, source_url, last_verified_at, is_active
)
select
  p.id, v.measure, v.amount_type, v.amount_min_cad, v.amount_max_cad,
  v.unit_label_fr, v.unit_label_en, v.conditions,
  'https://TODO-verify-official-url', '2026-10-19', false
from public.rebate_programs p
join (
  values
    (
      'nbp-total-home-energy-savings',
      'mini_split_heat_pump'::public.measure_code,
      'fixed'::public.amount_type,
      400.00, 400.00, null, null,
      '{"requires_program_pre_evaluation": true}'::jsonb
    ),
    (
      'nbp-total-home-energy-savings',
      'central_heat_pump'::public.measure_code,
      'fixed'::public.amount_type,
      1500.00, 1500.00, null, null,
      '{"requires_program_pre_evaluation": true}'::jsonb
    ),
    (
      'nbp-total-home-energy-savings',
      'windows'::public.measure_code,
      'per_unit'::public.amount_type,
      50.00, 50.00, 'par fenêtre', 'per window',
      '{"requires_program_pre_evaluation": true}'::jsonb
    ),
    (
      'nbp-total-home-energy-savings',
      'doors'::public.measure_code,
      'per_unit'::public.amount_type,
      50.00, 50.00, 'par porte', 'per door',
      '{"requires_program_pre_evaluation": true}'::jsonb
    ),
    (
      'nbp-total-home-energy-savings',
      'air_sealing'::public.measure_code,
      'range'::public.amount_type,
      250.00, 550.00, null, null,
      '{"requires_program_pre_evaluation": true}'::jsonb
    )
) as v(
  slug, measure, amount_type, amount_min_cad, amount_max_cad,
  unit_label_fr, unit_label_en, conditions
) on p.slug = v.slug;
