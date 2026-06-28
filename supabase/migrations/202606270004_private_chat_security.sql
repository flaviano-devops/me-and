-- Private chat hardening and persistent character identity synchronization.

create or replace function public.is_chat_member(target_room_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.chat_members
    where room_id = target_room_id and user_id = target_user_id
  );
$$;

create or replace function public.can_access_chat_room(target_room_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.chat_rooms
    where id = target_room_id
      and (is_public or public.is_chat_member(id, target_user_id))
  );
$$;

revoke all on function public.is_chat_member(uuid, uuid) from public;
revoke all on function public.can_access_chat_room(uuid, uuid) from public;
grant execute on function public.is_chat_member(uuid, uuid) to authenticated;
grant execute on function public.can_access_chat_room(uuid, uuid) to authenticated;

drop policy if exists "Membros veem suas salas" on public.chat_rooms;
drop policy if exists "Autenticados veem salas públicas" on public.chat_rooms;
create policy "Acesso a salas publicas ou privadas do membro"
on public.chat_rooms for select to authenticated
using (is_public or public.is_chat_member(id, auth.uid()));

drop policy if exists "Autenticados veem participantes" on public.chat_members;
drop policy if exists "Membros veem participantes da sala" on public.chat_members;
create policy "Membros veem participantes da sala"
on public.chat_members for select to authenticated
using (public.can_access_chat_room(room_id, auth.uid()));

drop policy if exists "Usuário entra na sala" on public.chat_members;
drop policy if exists "Usuario entra em sala publica" on public.chat_members;
create policy "Usuario entra em sala publica"
on public.chat_members for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (select 1 from public.chat_rooms r where r.id = room_id and r.is_public)
);

drop policy if exists "Membros veem mensagens" on public.chat_messages;
create policy "Membros veem mensagens"
on public.chat_messages for select to authenticated
using (public.is_chat_member(room_id, auth.uid()));

drop policy if exists "Membros enviam mensagens" on public.chat_messages;
create policy "Membros enviam mensagens"
on public.chat_messages for insert to authenticated
with check (
  user_id = auth.uid()
  and public.is_chat_member(room_id, auth.uid())
  and exists (
    select 1 from public.member_profiles p
    where p.user_id = auth.uid() and p.selected_character_slug = chat_messages.character_slug
  )
);

create or replace function public.sync_member_chat_identity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.selected_character_slug is distinct from old.selected_character_slug then
    update public.chat_members
    set character_slug = new.selected_character_slug
    where user_id = new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_member_chat_identity_trigger on public.member_profiles;
create trigger sync_member_chat_identity_trigger
after update of selected_character_slug on public.member_profiles
for each row execute function public.sync_member_chat_identity();

create or replace function public.start_private_chat(target_user_id uuid, initial_message text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  room_id_value uuid;
  own_character text;
  target_character text;
  key_value text;
begin
  if auth.uid() is null then raise exception 'Faça login para iniciar uma conversa'; end if;
  if target_user_id = auth.uid() then raise exception 'Você não pode iniciar um chat consigo mesmo'; end if;
  if char_length(trim(initial_message)) < 1 then raise exception 'Escreva uma mensagem'; end if;
  if char_length(trim(initial_message)) > 1000 then raise exception 'A mensagem deve ter até 1000 caracteres'; end if;

  select selected_character_slug into own_character from public.member_profiles where user_id = auth.uid();
  select selected_character_slug into target_character from public.member_profiles where user_id = target_user_id;
  if own_character is null or target_character is null then raise exception 'Os dois usuários precisam ter personagens'; end if;

  key_value := least(auth.uid()::text, target_user_id::text) || ':' || greatest(auth.uid()::text, target_user_id::text);

  insert into public.chat_rooms (title, description, owner_id, is_public, direct_key)
  values (own_character || ' & ' || target_character, 'Conversa privada', auth.uid(), false, key_value)
  on conflict (direct_key) do update set direct_key = excluded.direct_key
  returning id into room_id_value;

  insert into public.chat_members (room_id, user_id, character_slug) values
    (room_id_value, auth.uid(), own_character),
    (room_id_value, target_user_id, target_character)
  on conflict (room_id, user_id) do update set character_slug = excluded.character_slug;

  insert into public.chat_messages (room_id, user_id, character_slug, body)
  values (room_id_value, auth.uid(), own_character, trim(initial_message));

  return room_id_value;
end;
$$;

revoke all on function public.start_private_chat(uuid, text) from public;
grant execute on function public.start_private_chat(uuid, text) to authenticated;
