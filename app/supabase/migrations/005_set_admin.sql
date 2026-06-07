-- Set finnqrk@gmail.com as admin (existing account)
update public.profiles
set role = 'admin'
where email = 'finnqrk@gmail.com';

-- Auto-assign admin on signup for this email
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
begin
  user_role := coalesce((new.raw_user_meta_data->>'role'), 'customer');
  if new.email = 'finnqrk@gmail.com' then
    user_role := 'admin';
  end if;
  insert into public.profiles (id, email, role, full_name, company_name)
  values (
    new.id,
    new.email,
    user_role,
    coalesce((new.raw_user_meta_data->>'full_name'), split_part(new.email, '@', 1)),
    (new.raw_user_meta_data->>'company_name')
  );
  return new;
end;
$$ language plpgsql security definer;
