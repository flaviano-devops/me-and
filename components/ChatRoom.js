"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import { getCharacter } from "@/lib/characters";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ChatRoom({ roomId }) {
  const [room, setRoom] = useState(null);
  const [profile, setProfile] = useState(null);
  const [peer, setPeer] = useState(null);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [connectionState, setConnectionState] = useState("connecting");
  const [status, setStatus] = useState("");
  const endRef = useRef(null);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) return;
    let channel;
    let refreshTimer;
    const mergeMessages = (incoming) => setMessages((current) => {
      const byId = new Map(current.map((item) => [String(item.id), item]));
      incoming.forEach((item) => byId.set(String(item.id), item));
      return [...byId.values()].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    });
    const start = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return window.location.assign("/admin");
      setUser(auth.user);

      const { data: memberProfile } = await supabase.from("member_profiles").select("*").eq("user_id", auth.user.id).single();
      if (!memberProfile) return window.location.assign("/escolher-personagem");
      setProfile(memberProfile);

      const { data: roomData, error: roomError } = await supabase.from("chat_rooms").select("*").eq("id", roomId).single();
      if (roomError || !roomData) { setLoading(false); return setStatus("Esta conversa não existe ou é privada para outros participantes."); }
      setRoom(roomData);

      let { data: members, error: membersError } = await supabase.from("chat_members").select("user_id,character_slug").eq("room_id", roomId);
      if (membersError) { setLoading(false); return setStatus(membersError.message); }
      const alreadyMember = (members || []).some((member) => member.user_id === auth.user.id);

      if (!alreadyMember && roomData.is_public) {
        const { error: joinError } = await supabase.from("chat_members").insert({ room_id: roomId, user_id: auth.user.id, character_slug: memberProfile.selected_character_slug });
        if (joinError) { setLoading(false); return setStatus(joinError.message); }
        members = [...(members || []), { user_id: auth.user.id, character_slug: memberProfile.selected_character_slug }];
      }
      if (!roomData.is_public && !alreadyMember) { setLoading(false); return setStatus("Você não participa desta conversa privada."); }
      setMemberCount((members || []).length);

      const peerMember = (members || []).find((member) => member.user_id !== auth.user.id);
      if (peerMember) {
        const { data: currentPeer } = await supabase.from("member_profiles").select("selected_character_slug").eq("user_id", peerMember.user_id).maybeSingle();
        setPeer(getCharacter(currentPeer?.selected_character_slug || peerMember.character_slug) || null);
      }

      const { data: initial, error: messageError } = await supabase.from("chat_messages").select("*").eq("room_id", roomId).order("created_at", { ascending: true }).limit(200);
      if (messageError) setStatus(messageError.message);
      setMessages(initial || []);
      setLoading(false);

      channel = supabase.channel(`room-${roomId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` }, (payload) => {
        mergeMessages([payload.new]);
      }).subscribe((state) => setConnectionState(state === "SUBSCRIBED" ? "online" : state === "CHANNEL_ERROR" || state === "TIMED_OUT" ? "reconnecting" : "connecting"));

      refreshTimer = window.setInterval(async () => {
        const { data: recent } = await supabase.from("chat_messages").select("*").eq("room_id", roomId).order("created_at", { ascending: false }).limit(50);
        if (recent?.length) mergeMessages(recent);
      }, 5000);
    };
    start();
    return () => { if (channel) supabase.removeChannel(channel); if (refreshTimer) window.clearInterval(refreshTimer); };
  }, [roomId, supabase]);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const send = async (event) => {
    event.preventDefault();
    const input = event.currentTarget.elements.message;
    const body = input.value.trim();
    if (!body || !user || !profile) return;
    input.value = "";
    input.focus();
    const optimisticId = `pending-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const optimisticMessage = { id: optimisticId, room_id: roomId, user_id: user.id, character_slug: profile.selected_character_slug, body, created_at: new Date().toISOString(), pending: true };
    setMessages((current) => [...current, optimisticMessage]);
    setStatus("");
    const { data: savedMessage, error } = await supabase.from("chat_messages").insert({ room_id: roomId, user_id: user.id, character_slug: profile.selected_character_slug, body }).select("*").single();
    if (error) {
      setMessages((current) => current.map((item) => item.id === optimisticId ? { ...item, pending: false, failed: true } : item));
      return setStatus("A mensagem não foi enviada. Verifique sua conexão e tente novamente.");
    }
    setMessages((current) => [...current.filter((item) => item.id !== optimisticId && String(item.id) !== String(savedMessage.id)), savedMessage].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
  };

  const selectedCharacter = profile ? getCharacter(profile.selected_character_slug) : null;
  const isPrivate = room && !room.is_public;
  const roomTitle = isPrivate ? (peer ? `Conversa com ${peer.name}` : "Conversa privada") : room?.title;

  return (
    <main className={`chatRoomPage ${isPrivate ? "privateChatPage" : ""}`}>
      <header className="chatHeader">
        <Link href="/chats" aria-label="Voltar aos chats">‹</Link>
        {isPrivate
          ? <Avatar src={peer?.avatar} name={peer?.name || "Conversa privada"} size={46}/>
          : room && <span className="groupHeaderAvatar"><Image src={room.image_url || "/images/chat-cover.jpg"} alt={`Capa de ${room.title}`} fill sizes="46px" unoptimized={Boolean(room.image_url?.startsWith("http"))}/></span>}
        <div><h1>{roomTitle || "Carregando chat..."}</h1><span>{isPrivate ? "Privado · somente vocês" : `Grupo público · ${memberCount} ${memberCount === 1 ? "participante" : "participantes"}`}</span></div>
        <span className={`chatHeaderStatus ${connectionState}`} title={connectionState === "online" ? "Conversa em tempo real" : "Reconectando"} aria-label={connectionState === "online" ? "Conversa em tempo real" : "Reconectando"}><i/></span>
      </header>
      <section className="messageList" aria-live="polite" aria-busy={loading}>
        {loading && <p className="chatEmpty">Carregando conversa...</p>}
        {!loading && messages.length === 0 && <p className="chatEmpty">Ainda não há mensagens. Comece a conversa.</p>}
        {messages.map((message) => {
          const character = getCharacter(message.character_slug);
          const own = message.user_id === user?.id;
          return <article className={`${own ? "message own" : "message"}${message.pending ? " pending" : ""}${message.failed ? " failed" : ""}`} key={message.id}><Avatar src={character?.avatar} name={character?.name || "Personagem"} size={42}/><div><strong>{own ? `Você · ${character?.name || "Personagem"}` : character?.name || "Personagem"}</strong><p>{message.body}</p><time>{message.pending ? "Enviando..." : message.failed ? "Não enviada" : new Date(message.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</time></div></article>;
        })}
        <div ref={endRef}/>
      </section>
      <form className="messageComposer" onSubmit={send}><Avatar src={selectedCharacter?.avatar} name={selectedCharacter?.name || "Personagem"} size={42}/><input name="message" maxLength="1000" autoComplete="off" aria-label="Mensagem" placeholder={selectedCharacter ? `Falar como ${selectedCharacter.name}...` : "Escreva uma mensagem..."} disabled={loading || !room}/><button type="submit" aria-label="Enviar mensagem" disabled={loading || !room}>➤</button></form>
      {status && <p className="chatStatus" role="status">{status}</p>}
    </main>
  );
}
