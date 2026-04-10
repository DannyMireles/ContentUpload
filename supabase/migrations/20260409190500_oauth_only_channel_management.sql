alter table company_channels
  add column if not exists provider_account_id text,
  add column if not exists scope_summary text,
  add column if not exists last_refreshed_at timestamptz,
  add column if not exists last_error text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'company_channels_connected_requires_access_token'
  ) then
    alter table company_channels
      add constraint company_channels_connected_requires_access_token
      check (status <> 'connected' or encrypted_access_token is not null);
  end if;
end
$$;

create table if not exists oauth_link_states (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  platform text not null check (platform in ('tiktok', 'instagram', 'youtube')),
  code_verifier text not null,
  return_to text not null default '/settings',
  created_by uuid,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists oauth_link_states_expires_at_idx
  on oauth_link_states (expires_at);

alter table oauth_link_states enable row level security;
