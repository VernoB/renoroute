-- Admin-edited checklist templates. No program facts are seeded.
-- RénoRoute does not file rebate applications for the homeowner.

create type public.rebate_checklist_kind as enum (
  'document',
  'invoice',
  'model_number',
  'deadline',
  'reminder'
);

create table public.rebate_checklist_items (
  id           uuid primary key default gen_random_uuid(),
  program_id   uuid not null references public.rebate_programs(id) on delete cascade,
  kind         public.rebate_checklist_kind not null,
  label_fr     text not null check (char_length(label_fr) between 1 and 200),
  label_en     text not null check (char_length(label_en) between 1 and 200),
  sort_order   int not null default 0,
  source_url   text check (source_url is null or source_url ~ '^https://'),
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index rebate_checklist_items_program_id_idx
  on public.rebate_checklist_items (program_id, sort_order);

create trigger trg_rebate_checklist_items_updated before update on public.rebate_checklist_items
  for each row execute function public.set_updated_at();

create trigger trg_audit_rebate_checklist_items
  after insert or update or delete on public.rebate_checklist_items
  for each row execute function public.audit_reference_change();

revoke all on table public.rebate_checklist_items from public, anon, authenticated;
grant select, insert, update, delete on table public.rebate_checklist_items to authenticated;
grant all on table public.rebate_checklist_items to service_role;

alter table public.rebate_checklist_items enable row level security;

create policy rebate_checklist_items_read on public.rebate_checklist_items
  for select to authenticated
  using (
    public.is_admin()
    or (
      is_published
      and exists (
        select 1 from public.rebate_programs as rp
        where rp.id = program_id and rp.is_published
      )
    )
  );

create policy rebate_checklist_items_admin_write on public.rebate_checklist_items
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
