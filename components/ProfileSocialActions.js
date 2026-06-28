"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ProfileSocialActions({ characterSlug }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [following, setFollowing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      setCurrentUser(data.user || null);
      const { data: owner } = await supabase.from("member_profiles").select("user_id").eq("selected_character_slug", characterSlug).maybeSingle();
      setOwnerId(owner?.user_id || null);
      if (data.user && owner?.user_id && data.user.id !== owner.user_id) {
        const { data: relation } = await supabase.from("follows").select("follower_id").eq("follower_id", data.user.id).eq("following_id", owner.user_id).maybeSingle();
        setFollowing(Boolean(relation));
      }
    });
  }, [characterSlug, supabase]);

  if (!ownerId || currentUser?.id === ownerId) return null;

  const requireLogin = () => {
    if (currentUser) return true;
    router.push("/admin");
    return false;
  };

  const toggleFollow = async () => {
    if (!requireLogin()) return;
    const query = following
      ? supabase.from("follows").delete().eq("follower_id", currentUser.id).eq("following_id", ownerId)
      : supabase.from("follows").insert({ follower_id: currentUser.id, following_id: ownerId });
    const { error } = await query;
    if (error) return setStatus(error.message);
    setFollowing(!following);
  };

  const startChat = async (event) => {
    event.preventDefault();
    if (!requireLogin()) return;
    setStatus("Enviando...");
    const { data, error } = await supabase.rpc("start_private_chat", { target_user_id: ownerId, initial_message: message });
    if (error) return setStatus(error.message);
    router.push(`/chats/${data}`);
  };

  return (
    <div className="profileSocial">
      <div className="profileSocialButtons"><button onClick={toggleFollow}>{following ? "Seguindo" : "Seguir"}</button><button onClick={() => { if (requireLogin()) setChatOpen(true); }}>Chat</button></div>
      {chatOpen && <form className="firstMessageCard" onSubmit={startChat}><h3>Enviar primeira mensagem</h3><textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength="1000" placeholder="Escreva sua mensagem..." required/><div><button type="button" onClick={() => setChatOpen(false)}>Cancelar</button><button type="submit">Enviar</button></div></form>}
      {status && <p role="status">{status}</p>}
    </div>
  );
}
