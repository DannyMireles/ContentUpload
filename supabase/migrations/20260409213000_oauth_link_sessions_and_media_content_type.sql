alter table media_assets
  add column if not exists content_type text;

create table if not exists oauth_link_sessions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  platform text not null check (platform in ('tiktok', 'instagram', 'youtube')),
  encrypted_access_token jsonb not null,
  encrypted_refresh_token jsonb,
  token_expires_at timestamptz,
  refresh_token_expires_at timestamptz,
  scope_summary text,
  candidates jsonb not null,
  return_to text not null default '/settings',
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists oauth_link_sessions_expires_at_idx
  on oauth_link_sessions (expires_at);

alter table oauth_link_sessions enable row level security;

insert into storage.buckets (id, name, public)
values ('automation-media', 'automation-media', false)
on conflict (id) do nothing;
