-- A homeowner cannot change role and cannot read another profile.
BEGIN;
SELECT plan(3);

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'authenticated', 'authenticated', 'person-a@example.com', '',
    now(), '{"provider":"email","providers":["email"]}', '{}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'authenticated', 'authenticated', 'person-b@example.com', '',
    now(), '{"provider":"email","providers":["email"]}', '{}',
    now(), now(), '', '', '', ''
  );

SET LOCAL role authenticated;
SELECT set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', true);
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}',
  true
);

SELECT is(
  (SELECT count(*)::int FROM public.profiles),
  1,
  'person A cannot read person B'
);

SELECT lives_ok(
  $$
    UPDATE public.profiles
    SET full_name = 'Ada'
    WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  $$,
  'person A can update an allowed profile column'
);

SELECT throws_ok(
  $$
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  $$,
  '42501',
  'permission denied for table profiles',
  'person A cannot change role'
);

SELECT * FROM finish();
ROLLBACK;
