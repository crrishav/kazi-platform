-- Migration: Add file uploads and customization to quotes

-- Add customization columns to quotes table
alter table public.quotes add column if not exists size_breakdown jsonb default '{}'::jsonb;
alter table public.quotes add column if not exists colors text[] default '{}';
alter table public.quotes add column if not exists print_placement text[] default '{}';
alter table public.quotes add column if not exists design_files jsonb default '[]'::jsonb;

-- Create quote_files table for file metadata
create table if not exists public.quote_files (
  id uuid default gen_random_uuid() primary key,
  quote_id uuid references public.quotes(id) on delete cascade not null,
  file_name text not null,
  file_path text not null,
  file_size integer,
  file_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index idx_quote_files_quote on public.quote_files(quote_id);

-- RLS for quote_files
alter table public.quote_files enable row level security;

create policy "Customers can view files for their quotes"
  on public.quote_files for select
  using (
    exists (
      select 1 from public.quotes q 
      where q.id = quote_files.quote_id and q.customer_id = auth.uid()
    )
  );

create policy "Employees and admins can view all quote files"
  on public.quote_files for select
  using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role in ('employee', 'admin')
    )
  );

create policy "Anyone can create quote files"
  on public.quote_files for insert
  with check (true);

create policy "Employees and admins can delete quote files"
  on public.quote_files for delete
  using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role in ('employee', 'admin')
    )
  );
