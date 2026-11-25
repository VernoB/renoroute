-- Homes accept every province code. NS drafts stay unpublished. Waitlist stores email + province only.
BEGIN;
SELECT plan(13);

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '33333333-3333-4333-8333-333333333333',
  'authenticated', 'authenticated', 'coverage@example.com', '',
  now(), '{"provider":"email","providers":["email"]}', '{}',
  now(), now(), '', '', '', ''
);

SELECT lives_ok(
  $$INSERT INTO public.homes (owner_id, province, postal_code_fsa)
    VALUES ('33333333-3333-4333-8333-333333333333', 'NS', 'B3H')$$,
  'Nova Scotia is a valid home province'
);

SELECT throws_ok(
  $$INSERT INTO public.homes (owner_id, province)
    VALUES ('33333333-3333-4333-8333-333333333333', 'XX')$$,
  '23514',
  'new row for relation "homes" violates check constraint "homes_province_check"',
  'an unknown province code is rejected'
);

SELECT ok(
  (
    SELECT status = 'closed'
      AND is_published = false
      AND last_verified_at = '2026-11-22'
      AND closes_on = '2025-12-31'
      AND name_fr_is_translation
    FROM public.rebate_programs
    WHERE slug = 'ns-home-heating-system-rebates'
  ),
  'Home Heating System Rebates stays closed and unpublished'
);

SELECT throws_ok(
  $$UPDATE public.rebate_programs
    SET is_published = true
    WHERE slug = 'ns-program-rebate-finder'$$,
  '23514',
  'new row for relation "rebate_programs" violates check constraint "rebate_programs_published_verified"',
  'the finder index cannot be published without a verified date'
);

SELECT is_empty(
  $$SELECT rules.id FROM public.rebate_rules rules
    JOIN public.rebate_programs programs ON programs.id = rules.program_id
    WHERE programs.slug = 'ns-home-heating-system-rebates'$$,
  'the closed heating program has no invented rebate rules'
);

SELECT is(
  (
    SELECT count(*)::int
    FROM public.rebate_programs
    WHERE jurisdiction = 'NS' AND status = 'open' AND is_published
  ),
  9,
  'nine open Nova Scotia programs are published'
);

SELECT ok(
  (
    SELECT is_published AND name_fr_is_translation AND status = 'open'
    FROM public.rebate_programs
    WHERE slug = 'ns-ens-home-energy-assessment'
  ),
  'the Home Energy Assessment is published and its French name is marked as a translation'
);

SELECT ok(
  (
    SELECT status = 'paused' AND is_published = false AND name_fr_is_translation
    FROM public.rebate_programs
    WHERE slug = 'ns-ens-eco-shift'
  ),
  'Eco Shift stays paused and unpublished'
);

SELECT is(
  (
    SELECT count(*)::int
    FROM public.rebate_programs
    WHERE is_published = false
      AND status = 'closed'
      AND slug IN (
        'ns-home-heating-system-rebates',
        'ns-oil-to-heat-pump-affordability',
        'ca-greener-homes-grant',
        'ns-ens-solarhomes',
        'ns-ens-mheep',
        'ns-clean-energy-financing'
      )
  ),
  6,
  'closed programs Brown named stay unpublished'
);

SELECT is(
  (
    SELECT count(*)::int
    FROM public.rebate_programs
    WHERE slug = 'ca-national-heat-pump-rebate' AND status IS DISTINCT FROM 'announced'
  ),
  0,
  'the National Heat Pump Rebate is not switched to open'
);

SELECT ok(
  (
    SELECT price_cad = 18.324
      AND effective_from IS NULL
      AND is_published
      AND unit = 'cents/kWh'
      AND source_url = 'https://www.nspower.ca/docs/default-source/regulatory/tariff-book-2026.pdf'
      AND verified_at = '2026-11-22 00:00:00+00'
    FROM public.energy_prices
    WHERE province = 'NS' AND fuel = 'electricity' AND price_cad = 18.324
  ),
  'the current Nova Scotia Power rate is published as sourced'
);

SELECT ok(
  (
    SELECT price_cad = 19.067
      AND effective_from = '2027-01-01'
      AND is_published
      AND unit = 'cents/kWh'
    FROM public.energy_prices
    WHERE province = 'NS' AND fuel = 'electricity' AND price_cad = 19.067
  ),
  'the 2027-01-01 Nova Scotia Power rate is published as sourced'
);

SET LOCAL role authenticated;
SELECT set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}',
  true
);

SELECT lives_ok(
  $$INSERT INTO public.coverage_waitlist (email, province, consent_notify)
    VALUES ('coverage@example.com', 'ON', true)$$,
  'a signed-in person can join the coverage waitlist with consent'
);

SELECT * FROM finish();
ROLLBACK;
