-- Homes accept every province code. NS drafts stay unpublished. Waitlist stores email + province only.
BEGIN;
SELECT plan(6);

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
  'an unknown province code is rejected'
);

SELECT results_eq(
  $$SELECT is_published, last_verified_at IS NULL
    FROM public.rebate_programs
    WHERE slug = 'ns-home-heating-system-rebates'$$,
  $$SELECT false, true$$,
  'the NS heating draft is unpublished and unverified'
);

SELECT throws_ok(
  $$UPDATE public.rebate_programs
    SET is_published = true
    WHERE slug = 'ns-home-heating-system-rebates'$$,
  '23514',
  'a draft cannot be published without a verified date'
);

SELECT is_empty(
  $$SELECT id FROM public.rebate_rules rules
    JOIN public.rebate_programs programs ON programs.id = rules.program_id
    WHERE programs.slug = 'ns-home-heating-system-rebates'$$,
  'the NS draft has no invented rebate rules'
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
