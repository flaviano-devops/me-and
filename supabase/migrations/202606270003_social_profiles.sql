alter table public.character_profiles add column if not exists bio_blocks jsonb not null default '[]'::jsonb;

drop policy if exists "Usuários autenticados podem criar perfis" on public.character_profiles;
drop policy if exists "Usuários autenticados podem editar perfis" on public.character_profiles;

create policy "Dono do personagem cria perfil" on public.character_profiles for insert to authenticated
with check (
  auth.uid() = updated_by and exists (
    select 1 from public.member_profiles m
    where m.user_id = auth.uid() and m.selected_character_slug = character_profiles.slug
  )
);

create policy "Dono do personagem edita perfil" on public.character_profiles for update to authenticated
using (exists (
  select 1 from public.member_profiles m
  where m.user_id = auth.uid() and m.selected_character_slug = character_profiles.slug
))
with check (auth.uid() = updated_by);

create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

alter table public.follows enable row level security;
create policy "Autenticados veem seguidores" on public.follows for select to authenticated using (true);
create policy "Usuário segue outra pessoa" on public.follows for insert to authenticated with check (follower_id = auth.uid());
create policy "Usuário deixa de seguir" on public.follows for delete to authenticated using (follower_id = auth.uid());

alter table public.chat_rooms add column if not exists direct_key text unique;
drop policy if exists "Autenticados veem salas públicas" on public.chat_rooms;
create policy "Membros veem suas salas" on public.chat_rooms for select to authenticated
using (is_public or owner_id = auth.uid() or exists (
  select 1 from public.chat_members m where m.room_id = chat_rooms.id and m.user_id = auth.uid()
));

create or replace function public.start_private_chat(target_user_id uuid, initial_message text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  room_id_value uuid;
  own_character text;
  target_character text;
  key_value text;
begin
  if target_user_id = auth.uid() then raise exception 'Você não pode iniciar um chat consigo mesmo'; end if;
  if char_length(trim(initial_message)) < 1 then raise exception 'Escreva uma mensagem'; end if;
  select selected_character_slug into own_character from member_profiles where user_id = auth.uid();
  select selected_character_slug into target_character from member_profiles where user_id = target_user_id;
  if own_character is null or target_character is null then raise exception 'Os dois usuários precisam ter personagens'; end if;
  key_value := least(auth.uid()::text, target_user_id::text) || ':' || greatest(auth.uid()::text, target_user_id::text);
  select id into room_id_value from chat_rooms where direct_key = key_value;
  if room_id_value is null then
    insert into chat_rooms (title, description, owner_id, is_public, direct_key)
    values (own_character || ' & ' || target_character, 'Conversa privada', auth.uid(), false, key_value)
    returning id into room_id_value;
    insert into chat_members (room_id, user_id, character_slug) values
      (room_id_value, auth.uid(), own_character),
      (room_id_value, target_user_id, target_character);
  end if;
  insert into chat_messages (room_id, user_id, character_slug, body)
  values (room_id_value, auth.uid(), own_character, trim(initial_message));
  return room_id_value;
end; $$;

revoke all on function public.start_private_chat(uuid, text) from public;
grant execute on function public.start_private_chat(uuid, text) to authenticated;
