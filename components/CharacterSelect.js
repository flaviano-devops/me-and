"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Avatar from "./Avatar";
import { characters } from "@/lib/characters";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function CharacterSelect() {
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState(null);
  const [occupied, setOccupied] = useState([]);
  const [hasProfile, setHasProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const changing = searchParams.get("alterar") === "1";
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
        if (profile && !changing) return router.replace("/conta");
        setSelected(profile?.selected_character_slug || null);
        setHasProfile(Boolean(profile));
        setOccupied((used || []).map((item) => item.selected_character_slug));
      });
    });
  }, [changing, router, supabase]);

  const confirm = async () => {
    if (!user || !selected || saving) return;
    setSaving(true);
    setMessage("Salvando sua identidade...");
    const payload = {
      user_id: user.id,
      display_name: user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Membro",
      avatar_url: user.user_metadata?.avatar_url || null,
      selected_character_slug: selected,
      updated_at: new Date().toISOString()
    };
    const request = hasProfile
      ? supabase.from("member_profiles").update(payload).eq("user_id", user.id).select("user_id,selected_character_slug").single()
      : supabase.from("member_profiles").insert(payload).select("user_id,selected_character_slug").single();
    let result;
    try {
      result = await Promise.race([
        request,
        new Promise((_resolve, reject) => setTimeout(() => reject(new Error("O Supabase demorou para responder. Verifique as políticas RLS e tente novamente.")), 15000))
      ]);
    } catch (error) {
      setSaving(false);
      return setMessage(error.message);
    }
    const { data, error } = result;
    if (error?.code === "23505") {
      setOccupied((current) => [...new Set([...current, selected])]);
      setSelected(null);
      setSaving(false);
      return setMessage("Esse personagem acabou de ser escolhido por outra pessoa. Selecione outro disponível.");
    }
    if (error) { setSaving(false); return setMessage(`${error.message}${error.code ? ` (${error.code})` : ""}`); }
    if (!data) { setSaving(false); return setMessage("O Supabase não devolveu o perfil salvo. Confira as políticas da tabela member_profiles."); }
    setMessage(hasProfile ? "Identidade atualizada. Voltando para sua conta..." : "Identidade salva. Abrindo seus chats...");
    window.location.assign(hasProfile ? "/conta" : "/chats");
  };

  return (
    <main className="selectPage">
      <span className="eyebrow">{changing ? "Alterar identidade" : "Sua identidade na comunidade"}</span>
      <h1>{changing ? "Escolha sua nova identidade" : "Quem você será?"}</h1>
      <p>{changing ? "A mudança será aplicada a toda a comunidade e às próximas mensagens nos chats." : "Escolha um personagem para representar você em toda a comunidade. Depois, a troca será feita somente em Conta."}</p>
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
      <div className="selectionActions">
        {changing && <Link href="/conta">Cancelar</Link>}
        <button className="continueButton" disabled={!selected || saving} onClick={confirm}>{saving ? "Salvando..." : changing ? "Confirmar nova identidade" : "Continuar para os chats"}</button>
      </div>
      {message && <p role="status">{message}</p>}
    </main>
  );
}
