-- Deleting auth.users cascades the profile and homes; payments stay anonymized.
BEGIN;
SELECT plan(3);

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'authenticated', 'authenticated', 'person-a@example.com', '',
  now(), '{"provider":"email","providers":["email"]}', '{}',
  now(), now(), '', '', '', ''
);

INSERT INTO public.homes (id, owner_id, label)
VALUES (
  'aaaa1111-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'Home A'
);

INSERT INTO public.payments (id, owner_id, product_code, amount_cents, status)
VALUES (
  'aaaa3333-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'renoroute_plan_standard',
  4900,
  'succeeded'
);

DELETE FROM auth.users WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

SELECT is(
  (SELECT count(*)::int FROM public.homes WHERE owner_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  0,
  'homes are gone after the user is deleted'
);

SELECT is(
  (SELECT count(*)::int FROM public.profiles WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  0,
  'the profile is gone after the user is deleted'
);

SELECT is(
  (
    SELECT owner_id
    FROM public.payments
    WHERE id = 'aaaa3333-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  ),
  NULL,
  'the payment row is kept with owner_id anonymized'
);

SELECT * FROM finish();
ROLLBACK;
