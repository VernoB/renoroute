-- Canada-wide province codes. NB rows stay valid. NS rebate amounts are not inserted here.
-- GPS is never a source for province.

begin;

alter type public.program_status add value if not exists 'draft';

do $$
declare
  constraint_name text;
begin
  select con.conname into constraint_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'homes'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) ilike '%province%';
  if constraint_name is not null then
    execute format('alter table public.homes drop constraint %I', constraint_name);
  end if;
end $$;

alter table public.homes
  add constraint homes_province_check check (
    province in ('NB','NS','PE','NL','QC','ON','MB','SK','AB','BC','YT','NT','NU')
  );

alter table public.profiles
  add column if not exists province text
  check (province is null or province in ('NB','NS','PE','NL','QC','ON','MB','SK','AB','BC','YT','NT','NU'));

grant update (province) on public.profiles to authenticated;

alter table public.energy_prices
  add column if not exists province text not null default 'NB'
  check (province in ('NB','NS','PE','NL','QC','ON','MB','SK','AB','BC','YT','NT','NU'));

alter table public.rebate_programs alter column last_verified_at drop not null;

alter table public.rebate_programs
  drop constraint if exists rebate_programs_published_verified;

alter table public.rebate_programs
  add constraint rebate_programs_published_verified
  check (is_published = false or last_verified_at is not null);

create table if not exists public.coverage_waitlist (
  id               uuid primary key default gen_random_uuid(),
  email            text not null check (char_length(email) between 5 and 254 and email ~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'),
  province         text not null check (province in ('NB','NS','PE','NL','QC','ON','MB','SK','AB','BC','YT','NT','NU')),
  consent_notify   boolean not null check (consent_notify),
  created_at       timestamptz not null default now()
);

create unique index if not exists coverage_waitlist_email_province
  on public.coverage_waitlist (lower(email), province);

alter table public.coverage_waitlist enable row level security;

revoke all on public.coverage_waitlist from anon, authenticated;
grant insert (email, province, consent_notify) on public.coverage_waitlist to authenticated;
grant select, delete on public.coverage_waitlist to authenticated;

drop policy if exists coverage_waitlist_insert on public.coverage_waitlist;
create policy coverage_waitlist_insert on public.coverage_waitlist
  for insert to authenticated
  with check (consent_notify is true);

drop policy if exists coverage_waitlist_admin_select on public.coverage_waitlist;
create policy coverage_waitlist_admin_select on public.coverage_waitlist
  for select to authenticated
  using (public.is_admin());

drop policy if exists coverage_waitlist_admin_delete on public.coverage_waitlist;
create policy coverage_waitlist_admin_delete on public.coverage_waitlist
  for delete to authenticated
  using (public.is_admin());

commit;
