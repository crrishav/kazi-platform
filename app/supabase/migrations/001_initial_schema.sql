-- Enable RLS
alter table if exists public.profiles enable row level security;

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'employee', 'admin')),
  company_name text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create quotes table
create table if not exists public.quotes (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.profiles(id) on delete cascade not null,
  product_type text not null,
  quantity integer not null,
  details text,
  status text not null default 'pending' check (status in ('pending', 'quoted', 'accepted', 'rejected')),
  quoted_price decimal(10,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create orders table
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.profiles(id) on delete cascade not null,
  quote_id uuid references public.quotes(id) on delete set null,
  product_type text not null,
  quantity integer not null,
  unit_price decimal(10,2) not null,
  total_price decimal(10,2) not null,
  status text not null default 'ordered' check (status in ('ordered', 'cutting', 'sewing', 'printing', 'qc', 'shipping', 'delivered')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create order_updates table
create table if not exists public.order_updates (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  status text not null,
  note text,
  photo_url text,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create messages table
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create pricing_tiers table
create table if not exists public.pricing_tiers (
  id uuid default gen_random_uuid() primary key,
  product_type text not null,
  min_qty integer not null,
  max_qty integer,
  price_per_unit decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index idx_quotes_customer on public.quotes(customer_id);
create index idx_orders_customer on public.orders(customer_id);
create index idx_orders_quote on public.orders(quote_id);
create index idx_order_updates_order on public.order_updates(order_id);
create index idx_messages_order on public.messages(order_id);
create index idx_pricing_product on public.pricing_tiers(product_type);

-- RLS Policies for profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Employees and admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role in ('employee', 'admin')
    )
  );

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can update all profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert profiles"
  on public.profiles for insert
  with check (
    exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

-- RLS Policies for quotes
alter table public.quotes enable row level security;

create policy "Customers can view own quotes"
  on public.quotes for select
  using (customer_id = auth.uid());

create policy "Employees and admins can view all quotes"
  on public.quotes for select
  using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role in ('employee', 'admin')
    )
  );

create policy "Anyone can create quotes"
  on public.quotes for insert
  with check (true);

create policy "Admins can update quotes"
  on public.quotes for update
  using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Employees can update quote status"
  on public.quotes for update
  using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role = 'employee'
    )
  );

-- RLS Policies for orders
alter table public.orders enable row level security;

create policy "Customers can view own orders"
  on public.orders for select
  using (customer_id = auth.uid());

create policy "Employees and admins can view all orders"
  on public.orders for select
  using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role in ('employee', 'admin')
    )
  );

create policy "Employees and admins can create orders"
  on public.orders for insert
  with check (
    exists (
      select 1 from public.profiles where id = auth.uid() and role in ('employee', 'admin')
    )
  );

create policy "Employees and admins can update orders"
  on public.orders for update
  using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role in ('employee', 'admin')
    )
  );

-- RLS Policies for order_updates
alter table public.order_updates enable row level security;

create policy "Customers can view updates for their orders"
  on public.order_updates for select
  using (
    exists (
      select 1 from public.orders o 
      where o.id = order_updates.order_id and o.customer_id = auth.uid()
    )
  );

create policy "Employees and admins can view all order updates"
  on public.order_updates for select
  using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role in ('employee', 'admin')
    )
  );

create policy "Employees and admins can create order updates"
  on public.order_updates for insert
  with check (
    exists (
      select 1 from public.profiles where id = auth.uid() and role in ('employee', 'admin')
    )
  );

-- RLS Policies for messages
alter table public.messages enable row level security;

create policy "Users can view messages for their orders"
  on public.messages for select
  using (
    sender_id = auth.uid() or
    exists (
      select 1 from public.orders o 
      where o.id = messages.order_id and o.customer_id = auth.uid()
    )
  );

create policy "Employees and admins can view all messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role in ('employee', 'admin')
    )
  );

create policy "Users can create messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

-- RLS Policies for pricing_tiers
alter table public.pricing_tiers enable row level security;

create policy "Anyone can view pricing tiers"
  on public.pricing_tiers for select
  using (true);

create policy "Admins can manage pricing tiers"
  on public.pricing_tiers for all
  using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger for orders updated_at
drop trigger if exists on_orders_updated on public.orders;
create trigger on_orders_updated
  before update on public.orders
  for each row execute procedure public.handle_updated_at();

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (
    new.id, 
    new.email, 
    coalesce((new.raw_user_meta_data->>'role'), 'customer'),
    coalesce((new.raw_user_meta_data->>'full_name'), split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
