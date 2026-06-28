-- Custom square cover selected by the creator of a public/group chat.

alter table public.chat_rooms
add column if not exists image_url text;

drop function if exists public.create_chat_room(text, text);

create or replace function public.create_chat_room(
  room_title text,
  room_description text default '',
  room_image_url text default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_room_id uuid;
  chosen_character text;
begin
  select selected_character_slug into chosen_character
  from public.member_profiles
  where user_id = auth.uid();

  if chosen_character is null then
    raise exception 'Escolha um personagem antes de criar uma sala';
  end if;

  insert into public.chat_rooms (title, description, owner_id, is_public, image_url)
  values (trim(room_title), coalesce(trim(room_description), ''), auth.uid(), true, nullif(trim(room_image_url), ''))
  returning id into new_room_id;

  insert into public.chat_members (room_id, user_id, character_slug)
  values (new_room_id, auth.uid(), chosen_character);

  return new_room_id;
end;
$$;

grant execute on function public.create_chat_room(text, text, text) to authenticated;
