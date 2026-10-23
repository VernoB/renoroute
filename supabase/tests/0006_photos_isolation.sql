-- Person A cannot read or write person B's photos, and cannot upload
-- into person B's storage folder. Person A can insert a photo on their own home.
--
-- storage.objects columns verified on local supabase_db_RenoRoute (CLI 2.121.0):
-- bucket_id, name, owner (uuid, deprecated), owner_id (text), metadata.
-- is_delete_marker / is_versioned default; path_tokens is generated.
BEGIN;
SELECT plan(4);

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

INSERT INTO public.homes (id, owner_id, label)
VALUES
  (
    'aaaa1111-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'Home A'
  ),
  (
    'bbbb1111-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'Home B'
  );

INSERT INTO public.home_photos (id, home_id, owner_id, category, storage_path)
VALUES (
  'bbbb2222-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'bbbb1111-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'exterior',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/bbbb1111-bbbb-4bbb-8bbb-bbbbbbbbbbbb/bbbb2222-bbbb-4bbb-8bbb-bbbbbbbbbbbb.jpg'
);

SET LOCAL role authenticated;
SELECT set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', true);
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}',
  true
);

SELECT is(
  (SELECT count(*)::int FROM public.home_photos),
  0,
  'person A cannot select person B home_photos'
);

SELECT throws_ok(
  $$
    INSERT INTO public.home_photos (home_id, owner_id, category, storage_path)
    VALUES (
      'bbbb1111-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'exterior',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/bbbb1111-bbbb-4bbb-8bbb-bbbbbbbbbbbb/aaaa3333-aaaa-4aaa-8aaa-aaaaaaaaaaaa.jpg'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "home_photos"',
  'person A cannot insert a home_photos row on person B home'
);

SELECT throws_ok(
  $$
    INSERT INTO storage.objects (bucket_id, name, owner, owner_id, metadata)
    VALUES (
      'home-photos',
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/bbbb1111-bbbb-4bbb-8bbb-bbbbbbbbbbbb/ffff1111-ffff-4fff-8fff-ffffffffffff.jpg',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      '{}'::jsonb
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "objects"',
  'person A cannot insert storage.objects into person B folder'
);

SELECT lives_ok(
  $$
    INSERT INTO public.home_photos (id, home_id, owner_id, category, storage_path)
    VALUES (
      'aaaa2222-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'aaaa1111-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'exterior',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/aaaa1111-aaaa-4aaa-8aaa-aaaaaaaaaaaa/aaaa2222-aaaa-4aaa-8aaa-aaaaaaaaaaaa.jpg'
    )
  $$,
  'person A can insert a photo on their own home'
);

SELECT * FROM finish();
ROLLBACK;
