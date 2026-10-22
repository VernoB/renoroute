-- Tracks whether a homeowner has contacted a registered energy advisor.
-- The official program link and rules are TODO(verify). The app does not book appointments.

create type public.energy_advisor_status as enum (
  'none',
  'contacted',
  'pre_evaluation_booked',
  'pre_evaluation_done',
  'post_evaluation_done'
);

alter table public.homes
  add column energy_advisor_status public.energy_advisor_status not null default 'none',
  add column pre_evaluation_date date;
