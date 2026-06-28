"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";
import { characters } from "@/lib/characters";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function CharacterSelect() {
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState(null);
  const [occupied, setOccupied] = useState([]);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return router.replace("/admin");
      setUser(data.user);
      Promise.all([
        supabase.from("member_profiles").select("selected_character_slug").eq("user_id", data.user.id).maybeSingle(),
        supabase.from("member_profiles").select("selected_character_slug,user_id").neq("user_id", data.user.id)
      ]).then(([{ data: profile }, { data: used }]) => {
        setSelected(profile?.selected_character_slug || null);
        setOccupied((used || []).map((item) => item.selected_character_slug));
      });
    });
  }, [router, supabase]);

  const confirm = async () => {
    if (!user || !selected) return;
    setMessage("Salvando sua identidade...");
    const { error } = await supabase.from("member_profiles").upsert({
      user_id: user.id,
      display_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Membro",
      avatar_url: user.user_metadata?.avatar_url || null,
      selected_character_slug: selected,
      updated_at: new Date().toISOString()
    });
    if (error?.code === "23505") {
      setOccupied((current) => [...new Set([...current, selected])]);
      setSelected(null);
      return setMessage("Esse personagem acabou de ser escolhido por outra pessoa. Selecione outro disponível.");
    }
    if (error) return setMessage(error.message);
    router.push("/chats");
  };

  return (
    <main className="selectPage">
      <span className="eyebrow">Sua identidade na comunidade</span>
      <h1>Quem você será?</h1>
      <p>Escolha um personagem para representar você nas salas. Você poderá trocar depois.</p>
      <div className="selectGrid">
        {characters.map((character) => {
          const unavailable = occupied.includes(character.slug);
          return (
          <button className={`${selected === character.slug ? "selected" : ""} ${unavailable ? "unavailable" : ""}`} disabled={unavailable} onClick={() => setSelected(character.slug)} key={character.slug}>
            <Avatar src={character.avatar} name={character.name} size={88} />
            <strong>{character.name}</strong><small>{unavailable ? "Já selecionado" : character.summary}</small>
          </button>
        )})}
      </div>
      <button className="continueButton" disabled={!selected} onClick={confirm}>Continuar para os chats</button>
      {message && <p role="status">{message}</p>}
    </main>
  );
}
