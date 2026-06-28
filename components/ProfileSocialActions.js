"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";
import { getCharacter } from "@/lib/characters";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ProfileSocialActions({ characterSlug }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [owner, setOwner] = useState(null);
  const [following, setFollowing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const character = getCharacter(characterSlug);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      setCurrentUser(data.user || null);
      const { data: ownerProfile } = await supabase.from("member_profiles").select("user_id,display_name,created_at").eq("selected_character_slug", characterSlug).maybeSingle();
      setOwner(ownerProfile || null);
      if (data.user && ownerProfile?.user_id && data.user.id !== ownerProfile.user_id) {
        const { data: relation } = await supabase.from("follows").select("follower_id").eq("follower_id", data.user.id).eq("following_id", ownerProfile.user_id).maybeSingle();
        setFollowing(Boolean(relation));
      }
    });
  }, [characterSlug, supabase]);

  if (!owner || currentUser?.id === owner.user_id) return null;

  const requireLogin = () => {
    if (currentUser) return true;
    router.push("/admin");
    return false;
  };

  const toggleFollow = async () => {
    if (!requireLogin()) return;
    setStatus(following ? "Deixando de seguir..." : "Seguindo perfil...");
    const query = following
      ? supabase.from("follows").delete().eq("follower_id", currentUser.id).eq("following_id", owner.user_id)
      : supabase.from("follows").insert({ follower_id: currentUser.id, following_id: owner.user_id });
    const { error } = await query;
    if (error) return setStatus(error.message);
    setFollowing(!following);
    setStatus(following ? "Você deixou de seguir este perfil." : "Agora você segue este perfil.");
  };

  const startChat = async (event) => {
    event.preventDefault();
    if (!requireLogin() || sending) return;
    const initialMessage = message.trim();
    if (!initialMessage) return setStatus("Escreva uma mensagem para iniciar a conversa.");
    setSending(true);
    setStatus("Criando conversa privada...");
    const { data, error } = await supabase.rpc("start_private_chat", { target_user_id: owner.user_id, initial_message: initialMessage });
    if (error) { setSending(false); return setStatus(error.message); }
    setStatus("Conversa criada. Abrindo o chat...");
    window.location.assign(`/chats/${data}`);
  };

  return (
    <section className="profileSocial" aria-label="Interações com o perfil">
      <div className="profileOwnerSummary">
        <Avatar src={character?.avatar} name={character?.name || "Personagem"} size={52}/>
        <span><small>Personagem em uso</small><strong>{owner.display_name}</strong><em>Atua como {character?.name}</em></span>
      </div>
      <div className="profileSocialButtons">
        <button type="button" onClick={toggleFollow}>{following ? "✓ Seguindo" : "Seguir"}</button>
        <button type="button" onClick={() => { if (requireLogin()) { setChatOpen(true); setStatus(""); } }}>Conversar em privado</button>
      </div>
      {chatOpen && <form className="firstMessageCard" onSubmit={startChat}>
        <div className="firstMessageHeading"><Avatar src={character?.avatar} name={character?.name || "Personagem"} size={44}/><span><small>Nova conversa privada com</small><h3>{character?.name}</h3></span></div>
        <label htmlFor={`first-message-${characterSlug}`}>Primeira mensagem</label>
        <textarea id={`first-message-${characterSlug}`} value={message} onChange={(event) => setMessage(event.target.value)} maxLength="1000" placeholder={`Escreva para ${character?.name}...`} autoFocus required/>
        <small className="messageCounter">{message.length}/1000</small>
        <p>Somente vocês dois poderão acessar esta conversa.</p>
        <div><button type="button" onClick={() => { setChatOpen(false); setMessage(""); setStatus(""); }} disabled={sending}>Cancelar</button><button type="submit" disabled={sending}>{sending ? "Enviando..." : "Enviar e abrir chat"}</button></div>
      </form>}
      {status && <p className="profileSocialStatus" role="status">{status}</p>}
    </section>
  );
}
