-- The seven RLS scenarios required by docs/03-database.md §7.
BEGIN;
SELECT plan(16);

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

INSERT INTO public.assessments (id, home_id, owner_id, status, locale)
VALUES
  (
    'aaaa3333-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'aaaa1111-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'draft',
    'fr'
  ),
  (
    'bbbb3333-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'bbbb1111-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'draft',
    'en'
  );

INSERT INTO public.plans (
  id, assessment_id, home_id, owner_id, locale, content, rebate_snapshot, disclaimer_version
)
VALUES
  (
    'aaaa4444-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'aaaa3333-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'aaaa1111-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'fr',
    '{}'::jsonb,
    '{}'::jsonb,
    'v1'
  ),
  (
    'bbbb4444-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'bbbb3333-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'bbbb1111-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'en',
    '{}'::jsonb,
    '{}'::jsonb,
    'v1'
  );

INSERT INTO public.plan_items (
  id, plan_id, owner_id, priority, measure, title_fr, title_en
)
VALUES
  (
    'aaaa5551-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'aaaa4444-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    1, 'air_sealing', 'Un', 'One'
  ),
  (
    'aaaa5552-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'aaaa4444-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    2, 'air_sealing', 'Deux', 'Two'
  ),
  (
    'aaaa5553-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'aaaa4444-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    3, 'air_sealing', 'Trois', 'Three'
  ),
  (
    'bbbb5551-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'bbbb4444-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    1, 'air_sealing', 'B', 'B'
  );

INSERT INTO public.payments (id, owner_id, product_code, amount_cents, status)
VALUES (
  'bbbb6666-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'renoroute_plan_standard',
  4900,
  'succeeded'
);

INSERT INTO public.leads (id, plan_id, homeowner_id, consent_share_at)
VALUES (
  'bbbb7777-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'bbbb4444-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  now()
);

INSERT INTO public.rebate_programs (
  slug, administrator, name_fr, name_en, status, source_url, last_verified_at, is_published
)
VALUES (
  'unpublished-rls-fixture',
  'Fixture',
  'Non publié',
  'Unpublished',
  'open',
  'https://example.com/unpublished',
  '2026-10-23',
  false
);

SET LOCAL role authenticated;
SELECT set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', true);
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}',
  true
);

-- 1. User A sees none of B's rows.
SELECT is(
  (SELECT count(*)::int FROM public.homes WHERE id = 'bbbb1111-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  0,
  '1 homes: A cannot see B'
);
SELECT is(
  (SELECT count(*)::int FROM public.home_photos WHERE id = 'bbbb2222-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  0,
  '1 photos: A cannot see B'
);
SELECT is(
  (SELECT count(*)::int FROM public.assessments WHERE id = 'bbbb3333-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  0,
  '1 assessments: A cannot see B'
);
SELECT is(
  (SELECT count(*)::int FROM public.plans WHERE id = 'bbbb4444-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  0,
  '1 plans: A cannot see B'
);
SELECT is(
  (SELECT count(*)::int FROM public.plan_items WHERE id = 'bbbb5551-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  0,
  '1 plan_items: A cannot see B'
);
SELECT is(
  (SELECT count(*)::int FROM public.payments WHERE id = 'bbbb6666-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  0,
  '1 payments: A cannot see B'
);
SELECT is(
  (SELECT count(*)::int FROM public.leads WHERE id = 'bbbb7777-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  0,
  '1 leads: A cannot see B'
);

-- 2. Client cannot change profiles.role.
SELECT throws_ok(
  $$
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  $$,
  '42501',
  'permission denied for table profiles',
  '2 client cannot change profiles.role'
);

-- 3. Locked plan shows only two items.
SELECT is(
  (SELECT count(*)::int FROM public.plan_items WHERE plan_id = 'aaaa4444-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  2,
  '3 unpaid plan shows only two plan_items'
);

RESET ROLE;
UPDATE public.plans
SET unlocked_at = now()
WHERE id = 'aaaa4444-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

SET LOCAL role authenticated;
SELECT set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', true);
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}',
  true
);

SELECT is(
  (SELECT count(*)::int FROM public.plan_items WHERE plan_id = 'aaaa4444-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  3,
  '3 unlocked plan shows every plan_item'
);

-- 4. Client cannot insert plans, payments, or audit_log.
SELECT throws_ok(
  $$
    INSERT INTO public.plans (
      assessment_id, home_id, owner_id, locale, content, rebate_snapshot, disclaimer_version
    ) VALUES (
      'aaaa3333-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'aaaa1111-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'fr', '{}'::jsonb, '{}'::jsonb, 'v1'
    )
  $$,
  '42501',
  'permission denied for table plans',
  '4 client cannot insert plans'
);
SELECT throws_ok(
  $$
    INSERT INTO public.payments (owner_id, product_code, amount_cents)
    VALUES (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'renoroute_plan_standard',
      4900
    )
  $$,
  '42501',
  'permission denied for table payments',
  '4 client cannot insert payments'
);
SELECT throws_ok(
  $$
    INSERT INTO public.audit_log (action) VALUES ('account.delete')
  $$,
  '42501',
  'permission denied for table audit_log',
  '4 client cannot insert audit_log'
);

-- 6. Non-admin cannot write rebate_programs.
SELECT throws_ok(
  $$
    INSERT INTO public.rebate_programs (
      slug, administrator, name_fr, name_en, status, source_url, last_verified_at
    ) VALUES (
      'homeowner-write',
      'Fixture',
      'Interdit',
      'Forbidden',
      'open',
      'https://example.com/forbidden',
      '2026-10-23'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "rebate_programs"',
  '6 non-admin cannot write rebate_programs'
);

-- 7. Storage upload outside {uid}/ is refused.
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
  '7 storage upload outside uid folder is refused'
);

-- 5. anon does not see unpublished programs.
SET LOCAL role anon;
SELECT is(
  (SELECT count(*)::int FROM public.rebate_programs WHERE slug = 'unpublished-rls-fixture'),
  0,
  '5 anon cannot see unpublished rebate_programs'
);

SELECT * FROM finish();
ROLLBACK;
