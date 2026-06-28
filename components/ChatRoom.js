"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import { getCharacter } from "@/lib/characters";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ChatRoom({ roomId }) {
  const [room, setRoom] = useState(null);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("");
  const endRef = useRef(null);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) return;
    let channel;
    const start = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return window.location.assign("/admin");
      setUser(auth.user);
      const { data: memberProfile } = await supabase.from("member_profiles").select("*").eq("user_id", auth.user.id).single();
      if (!memberProfile) return window.location.assign("/escolher-personagem");
      setProfile(memberProfile);
      const { data: roomData, error: roomError } = await supabase.from("chat_rooms").select("*").eq("id", roomId).single();
      if (roomError) return setStatus(roomError.message);
      setRoom(roomData);
      await supabase.from("chat_members").insert({ room_id: roomId, user_id: auth.user.id, character_slug: memberProfile.selected_character_slug });
      const { data: initial } = await supabase.from("chat_messages").select("*").eq("room_id", roomId).order("created_at", { ascending: true }).limit(200);
      setMessages(initial || []);
      channel = supabase.channel(`room-${roomId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` }, (payload) => {
        setMessages((current) => current.some((item) => item.id === payload.new.id) ? current : [...current, payload.new]);
      }).subscribe();
    };
    start();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [roomId, supabase]);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const send = async (event) => {
    event.preventDefault();
    const input = event.currentTarget.elements.message;
    const body = input.value.trim();
    if (!body || !user || !profile) return;
    input.value = "";
    const { error } = await supabase.from("chat_messages").insert({ room_id: roomId, user_id: user.id, character_slug: profile.selected_character_slug, body });
    if (error) { setStatus(error.message); input.value = body; }
  };

  const selectedCharacter = profile ? getCharacter(profile.selected_character_slug) : null;
  return (
    <main className="chatRoomPage">
      <header className="chatHeader"><Link href="/chats" aria-label="Voltar aos chats">‹</Link><div><h1>{room?.title || "Carregando chat..."}</h1><span>Chat público · tempo real</span></div>{selectedCharacter && <Avatar src={selectedCharacter.avatar} name={selectedCharacter.name} size={46}/>}</header>
      <section className="messageList" aria-live="polite">
        {messages.map((message) => {
          const character = getCharacter(message.character_slug);
          const own = message.user_id === user?.id;
          return <article className={own ? "message own" : "message"} key={message.id}><Avatar src={character?.avatar} name={character?.name || "Personagem"} size={42}/><div><strong>{character?.name || "Personagem"}</strong><p>{message.body}</p><time>{new Date(message.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</time></div></article>;
        })}
        <div ref={endRef}/>
      </section>
      <form className="messageComposer" onSubmit={send}><Avatar src={selectedCharacter?.avatar} name={selectedCharacter?.name || "Personagem"} size={42}/><input name="message" maxLength="1000" autoComplete="off" placeholder={selectedCharacter ? `Falar como ${selectedCharacter.name}...` : "Escreva uma mensagem..."}/><button type="submit" aria-label="Enviar mensagem">➤</button></form>
      {status && <p className="chatStatus" role="status">{status}</p>}
    </main>
  );
}
