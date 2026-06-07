-- Storage bucket for design files
-- Run this in Supabase SQL Editor

-- Create the bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'design-files',
  'Design Files',
  false,
  20971520,
  array[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/pdf',
    'image/vnd.adobe.photoshop',
    'application/illustrator',
    'application/postscript'
  ]
)
on conflict (id) do nothing;

-- Allow authenticated users to upload
create policy "Allow authenticated uploads"
  on storage.objects for insert
  with check (bucket_id = 'design-files');

-- Allow anyone to upload (for anonymous quote submissions)
create policy "Allow public uploads"
  on storage.objects for insert
  with check (bucket_id = 'design-files');

-- Allow owners to view their files
create policy "Allow owners to view"
  on storage.objects for select
  using (bucket_id = 'design-files');

-- Allow employees and admins to view all
create policy "Allow employees to view all"
  on storage.objects for select
  using (
    bucket_id = 'design-files' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('employee', 'admin')
    )
  );
