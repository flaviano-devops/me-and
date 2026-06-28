"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import { characters, getCharacter } from "@/lib/characters";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const relativeTime = (date) => {
  if (!date) return "sem mensagens";
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} h`;
  return `${Math.floor(minutes / 1440)} d`;
};

function RoomRow({ room }) {
  const peerCharacter = getCharacter(room.peer?.character_slug);
  const lastSpeaker = getCharacter(room.last?.character_slug);
  const isPrivate = !room.is_public;
  const avatar = isPrivate ? peerCharacter : lastSpeaker;
  const title = isPrivate ? (peerCharacter?.name || "Conversa privada") : room.title;
  return <Link className={`roomRow ${isPrivate ? "privateRoom" : ""}`} href={`/chats/${room.id}`}>
    <span className="roomThumb"><Avatar src={avatar?.avatar} name={avatar?.name || title} size={72}/><i className={isPrivate ? "privateIndicator" : ""}/></span>
    <span className="roomText"><strong>{title}</strong><small>{room.last?.body || room.description || "Conversa começando..."}</small><em>{isPrivate ? "Chat privado · somente vocês" : "Chat público"}</em></span>
    <time>{relativeTime(room.last?.created_at)}</time>
  </Link>;
}

export default function ChatsList() {
  const [profile, setProfile] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = getSupabaseBrowserClient();

  const loadRooms = async (currentProfile) => {
    const { data: roomRows, error } = await supabase.from("chat_rooms").select("*").order("created_at", { ascending: false });
    if (error) { setLoading(false); return setMessage(error.message); }
    const enriched = await Promise.all((roomRows || []).map(async (room) => {
      const [{ data: last }, { data: members }] = await Promise.all([
        supabase.from("chat_messages").select("body,created_at,character_slug").eq("room_id", room.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("chat_members").select("user_id,character_slug").eq("room_id", room.id)
      ]);
      const peer = (members || []).find((member) => member.user_id !== currentProfile.user_id) || null;
      return { ...room, last, peer };
    }));
    setRooms(enriched);
    setLoading(false);
  };

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return window.location.assign("/admin");
      const { data: member } = await supabase.from("member_profiles").select("*").eq("user_id", data.user.id).maybeSingle();
      if (!member) return window.location.assign("/escolher-personagem");
      setProfile(member);
      loadRooms(member);
    });
  }, [supabase]);

  const createRoom = async (event) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setMessage("Criando sala pública...");
    const { data, error } = await supabase.rpc("create_chat_room", { room_title: fields.get("title"), room_description: fields.get("description") });
    if (error) return setMessage(error.message);
    window.location.assign(`/chats/${data}`);
  };

  const privateRooms = rooms.filter((room) => !room.is_public);
  const publicRooms = rooms.filter((room) => room.is_public);

  return (
    <main className="chatsPage">
      <header className="chatsHero">
        <Image src="/images/chat-cover.jpg" alt="Personagens de Jujutsu Kaisen" fill priority sizes="100vw" />
        <div><span className="eyebrow">Comunidade</span><h1>Meus chats</h1></div>
        <button onClick={() => setCreating((value) => !value)}>＋ Criar sala</button>
      </header>
      <section className="characterStrip" aria-label="Personagens disponíveis">
        {characters.map((character) => <Link href={`/personagens/${character.slug}`} key={character.slug}><Avatar src={character.avatar} name={character.name} size={66}/><span>{character.name.split(" ")[0]}</span></Link>)}
      </section>
      {profile && <div className="activeIdentity">Você está falando como <strong>{getCharacter(profile.selected_character_slug)?.name}</strong><Link href="/conta">Gerenciar na conta</Link></div>}
      {creating && <form className="createRoom" onSubmit={createRoom}><h2>Criar chat público</h2><p>Qualquer membro poderá entrar e participar.</p><input name="title" minLength="3" maxLength="60" placeholder="Nome da sala" required/><textarea name="description" maxLength="180" placeholder="Sobre o que vocês vão conversar?"/><div><button type="button" onClick={() => setCreating(false)}>Cancelar</button><button type="submit">Criar sala</button></div></form>}

      {privateRooms.length > 0 && <section className="rooms privateRooms"><div className="roomsHeading"><span><small>Somente participantes</small><h2>Conversas privadas</h2></span><b>{privateRooms.length}</b></div>{privateRooms.map((room) => <RoomRow room={room} key={room.id}/>)}</section>}
      <section className="rooms publicRooms"><div className="roomsHeading"><span><small>Comunidade</small><h2>Chats públicos</h2></span><b>{publicRooms.length}</b></div>{loading && <p className="roomsEmpty">Carregando conversas...</p>}{!loading && publicRooms.length === 0 && <p className="roomsEmpty">Nenhuma sala pública ainda. Crie a primeira.</p>}{publicRooms.map((room) => <RoomRow room={room} key={room.id}/>)}</section>
      {message && <p className="chatListStatus" role="status">{message}</p>}
    </main>
  );
}
