-- Every public table must have RLS. The seven scenarios live in 0008_rls_seven_scenarios.sql.
BEGIN;
SELECT plan(1);

SELECT is_empty(
  $$
    SELECT n.nspname || '.' || c.relname
    FROM pg_class AS c
    JOIN pg_namespace AS n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relrowsecurity = false
    ORDER BY 1
  $$,
  'every public table has row level security enabled'
);

SELECT * FROM finish();
ROLLBACK;
