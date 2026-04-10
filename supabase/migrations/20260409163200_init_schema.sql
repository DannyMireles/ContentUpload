create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  summary text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists company_members (
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create or replace function public.is_company_member(target_company_id uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members
    where company_members.company_id = target_company_id
      and company_members.user_id = auth.uid()
  );
$$;

create table if not exists company_channels (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  platform text not null check (platform in ('tiktok', 'instagram', 'youtube')),
  handle text not null,
  status text not null default 'needs-auth' check (status in ('connected', 'needs-auth', 'expired')),
  encrypted_access_token jsonb,
  encrypted_refresh_token jsonb,
  token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, platform)
);

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  storage_path text not null,
  original_filename text not null,
  transcript text,
  transcript_status text not null default 'pending' check (transcript_status in ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists automations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  media_asset_id uuid not null references media_assets(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'processing', 'posted', 'failed')),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists automation_targets (
  id uuid primary key default gen_random_uuid(),
  automation_id uuid not null references automations(id) on delete cascade,
  platform text not null check (platform in ('tiktok', 'instagram', 'youtube')),
  seo_mode text not null check (seo_mode in ('ai', 'manual')),
  title text not null default '',
  caption text not null default '',
  description text not null default '',
  generated_payload jsonb,
  scheduled_for timestamptz,
  posted_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled', 'processing', 'posted', 'failed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (automation_id, platform)
);

create index if not exists automation_targets_due_idx
  on automation_targets (scheduled_for)
  where status = 'scheduled';

create trigger handle_company_channels_updated_at
  before update on company_channels
  for each row
  execute function public.set_updated_at();

create trigger handle_media_assets_updated_at
  before update on media_assets
  for each row
  execute function public.set_updated_at();

create trigger handle_automations_updated_at
  before update on automations
  for each row
  execute function public.set_updated_at();

create trigger handle_automation_targets_updated_at
  before update on automation_targets
  for each row
  execute function public.set_updated_at();

alter table companies enable row level security;
alter table company_members enable row level security;
alter table company_channels enable row level security;
alter table media_assets enable row level security;
alter table automations enable row level security;
alter table automation_targets enable row level security;

create policy "company members can read companies"
  on companies
  for select
  using (public.is_company_member(id));

create policy "company members can read memberships"
  on company_members
  for select
  using (public.is_company_member(company_id));

create policy "company members can manage channels"
  on company_channels
  for all
  using (public.is_company_member(company_id))
  with check (public.is_company_member(company_id));

create policy "company members can manage media assets"
  on media_assets
  for all
  using (public.is_company_member(company_id))
  with check (public.is_company_member(company_id));

create policy "company members can manage automations"
  on automations
  for all
  using (public.is_company_member(company_id))
  with check (public.is_company_member(company_id));

create policy "company members can manage automation targets"
  on automation_targets
  for all
  using (
    exists (
      select 1
      from automations
      where automations.id = automation_targets.automation_id
        and public.is_company_member(automations.company_id)
    )
  )
  with check (
    exists (
      select 1
      from automations
      where automations.id = automation_targets.automation_id
        and public.is_company_member(automations.company_id)
    )
  );
