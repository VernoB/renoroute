BEGIN;
SELECT plan(2);

SELECT is_empty(
  $$ SELECT id FROM public.rebate_checklist_items $$,
  'checklist templates are empty until an admin enters a verified source'
);

SET LOCAL role anon;
SELECT throws_ok(
  $$ SELECT id FROM public.rebate_checklist_items $$,
  '42501',
  'permission denied for table rebate_checklist_items',
  'anon cannot read checklist templates'
);

SELECT * FROM finish();
ROLLBACK;
