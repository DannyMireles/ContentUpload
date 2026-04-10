create table if not exists company_oauth_apps (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  platform text not null check (platform in ('tiktok', 'instagram', 'youtube')),
  client_id text not null,
  encrypted_client_secret jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, platform)
);

create trigger handle_company_oauth_apps_updated_at
  before update on company_oauth_apps
  for each row
  execute function public.set_updated_at();

alter table company_oauth_apps enable row level security;
