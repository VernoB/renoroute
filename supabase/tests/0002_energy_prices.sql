-- Authenticated users read published energy prices only. Admins write. Anon has no grant.
BEGIN;
SELECT plan(5);

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-8111-111111111111',
    'authenticated', 'authenticated', 'homeowner@example.com', '',
    now(), '{"provider":"email","providers":["email"]}', '{}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-4222-8222-222222222222',
    'authenticated', 'authenticated', 'admin@example.com', '',
    now(), '{"provider":"email","providers":["email"]}', '{}',
    now(), now(), '', '', '', ''
  );

UPDATE public.profiles
SET role = 'admin'
WHERE id = '22222222-2222-4222-8222-222222222222';

INSERT INTO public.energy_prices (fuel, unit, price_cad, effective_from, source_url, is_published)
VALUES (
  'electricity',
  'kwh',
  1,
  '2020-01-01',
  'https://example.com/fixture',
  true
);

SELECT is_empty(
  $$
    SELECT c.relname
    FROM pg_class AS c
    JOIN pg_namespace AS n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'energy_prices'
      AND c.relrowsecurity = false
  $$,
  'energy_prices has row level security enabled'
);

SET LOCAL role anon;
SELECT throws_ok(
  $$ SELECT id FROM public.energy_prices $$,
  '42501',
  'permission denied for table energy_prices',
  'anon cannot read energy prices'
);

SET LOCAL role authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
  true
);

SELECT is(
  (SELECT count(*)::int FROM public.energy_prices),
  1,
  'a homeowner sees only the published fixture'
);

SELECT throws_ok(
  $$
    INSERT INTO public.energy_prices (fuel, is_published)
    VALUES ('propane', false)
  $$,
  '42501',
  'new row violates row-level security policy for table "energy_prices"',
  'a homeowner cannot insert an energy price'
);

SET LOCAL role authenticated;
SELECT set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}',
  true
);

SELECT lives_ok(
  $$
    INSERT INTO public.energy_prices (fuel, unit, price_cad, is_published)
    VALUES ('propane', 'TODO(verify)', NULL, false)
  $$,
  'an admin can insert an unpublished energy price'
);

SELECT * FROM finish();
ROLLBACK;
