BEGIN;
SELECT plan(2);

SELECT is(
  (
    SELECT string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder)
    FROM pg_enum AS e
    JOIN pg_type AS t ON t.oid = e.enumtypid
    JOIN pg_namespace AS n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'energy_advisor_status'
  ),
  'none,contacted,pre_evaluation_booked,pre_evaluation_done,post_evaluation_done',
  'energy advisor statuses match the product list'
);

SELECT is(
  (
    SELECT column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'homes'
      AND column_name = 'energy_advisor_status'
  ),
  '''none''::energy_advisor_status',
  'a home starts with no energy advisor contact'
);

SELECT * FROM finish();
ROLLBACK;
