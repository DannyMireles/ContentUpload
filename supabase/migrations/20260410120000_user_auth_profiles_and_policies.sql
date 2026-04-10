create table if not exists user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  approved boolean not null default false,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger handle_user_profiles_updated_at
  before update on user_profiles
  for each row
  execute function public.set_updated_at();

alter table user_profiles enable row level security;

create policy "users can read own profile"
  on user_profiles
  for select
  using (auth.uid() = user_id);

create policy "users can insert own profile"
  on user_profiles
  for insert
  with check (auth.uid() = user_id);

create policy "users can update own profile"
  on user_profiles
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and approved = (
      select user_profiles.approved
      from user_profiles
      where user_profiles.user_id = auth.uid()
    )
  );

create policy "authenticated users can create companies"
  on companies
  for insert
  with check (auth.role() = 'authenticated');

create policy "owners can update companies"
  on companies
  for update
  using (
    exists (
      select 1
      from company_members
      where company_members.company_id = companies.id
        and company_members.user_id = auth.uid()
        and company_members.role = 'owner'
    )
  )
  with check (
    exists (
      select 1
      from company_members
      where company_members.company_id = companies.id
        and company_members.user_id = auth.uid()
        and company_members.role = 'owner'
    )
  );

create policy "owners can delete companies"
  on companies
  for delete
  using (
    exists (
      select 1
      from company_members
      where company_members.company_id = companies.id
        and company_members.user_id = auth.uid()
        and company_members.role = 'owner'
    )
  );

create policy "members can insert their own membership"
  on company_members
  for insert
  with check (user_id = auth.uid());

create policy "company members can manage oauth link states"
  on oauth_link_states
  for all
  using (public.is_company_member(company_id))
  with check (public.is_company_member(company_id));

create policy "company members can manage oauth link sessions"
  on oauth_link_sessions
  for all
  using (public.is_company_member(company_id))
  with check (public.is_company_member(company_id));

create policy "company members can manage oauth apps"
  on company_oauth_apps
  for all
  using (public.is_company_member(company_id))
  with check (public.is_company_member(company_id));
