create table if not exists public.character_profiles (
  slug text primary key,
  name text not null,
  handle text not null,
  bio text not null default '',
  tags text[] not null default '{}',
  avatar_url text,
  cover_url text,
  stats jsonb not null default '["0", "0", "0"]'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.character_profiles enable row level security;

create policy "Perfis são públicos para leitura"
on public.character_profiles for select
to anon, authenticated
using (true);

create policy "Usuários autenticados podem criar perfis"
on public.character_profiles for insert
to authenticated
with check (auth.uid() = updated_by);

create policy "Usuários autenticados podem editar perfis"
on public.character_profiles for update
to authenticated
using (true)
with check (auth.uid() = updated_by);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-media', 'profile-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Imagens de perfil são públicas"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'profile-media');

create policy "Autenticados enviam imagens próprias"
on storage.objects for insert
to authenticated
with check (bucket_id = 'profile-media' and (storage.foldername(name))[2] = auth.uid()::text);

create policy "Autenticados atualizam imagens próprias"
on storage.objects for update
to authenticated
using (bucket_id = 'profile-media' and (storage.foldername(name))[2] = auth.uid()::text);
