"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "./Avatar";
import { getCharacter } from "@/lib/characters";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const formatDate = (value) => value
  ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value))
  : "Não informado";

export default function AccountPanel() {
  const [user, setUser] = useState(null);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const supabase = getSupabaseBrowserClient();
  const identity = getCharacter(member?.selected_character_slug);

  useEffect(() => {
    if (!supabase) return setLoading(false);
    supabase.auth.getUser().then(async ({ data, error }) => {
      if (error || !data.user) return window.location.assign("/admin?retorno=%2Fconta");
      setUser(data.user);
      const { data: profile, error: profileError } = await supabase.from("member_profiles").select("*").eq("user_id", data.user.id).maybeSingle();
      if (profileError) setMessage(profileError.message);
      setMember(profile || null);
      setLoading(false);
    });
  }, [supabase]);

  const signOut = async () => {
    setMessage("Encerrando sua sessão...");
    const { error } = await supabase.auth.signOut();
    if (error) return setMessage(error.message);
    window.location.assign("/admin");
  };

  if (loading) return <main className="accountPage"><p className="accountLoading" role="status">Carregando sua conta...</p></main>;

  return (
    <main className="accountPage">
      <header className="accountHeader">
        <span className="eyebrow">Central da conta</span>
        <h1>Sua conta e identidade</h1>
        <p>Gerencie sua sessão e o personagem que representa você em toda a comunidade.</p>
      </header>

      <section className="identityCard" aria-labelledby="identity-title">
        <div className="identityAvatar"><Avatar src={identity?.avatar} name={identity?.name || "Identidade"} size={112}/><i aria-hidden="true" /></div>
        <div className="identitySummary">
          <span className="accountLabel">Identidade ativa</span>
          <h2 id="identity-title">{identity?.name || "Escolha seu personagem"}</h2>
          <p>{identity ? `${identity.summary}. Esta identidade será usada automaticamente ao conversar nos chats.` : "Você ainda precisa escolher quem representará sua conta."}</p>
          <div className="identityActions">
            {identity && <Link className="accountPrimary" href={`/personagens/${identity.slug}`}>Ver meu perfil</Link>}
            <Link href={identity ? "/escolher-personagem?alterar=1" : "/escolher-personagem"}>{identity ? "Trocar personagem" : "Escolher personagem"}</Link>
          </div>
        </div>
      </section>

      <div className="accountGrid">
        <section className="accountCard" aria-labelledby="account-data-title">
          <span className="accountIcon" aria-hidden="true">✦</span>
          <div><span className="accountLabel">Dados pessoais</span><h2 id="account-data-title">Informações da conta</h2></div>
          <dl>
            <div><dt>Nome de exibição</dt><dd>{member?.display_name || user?.user_metadata?.display_name || "Membro"}</dd></div>
            <div><dt>E-mail</dt><dd>{user?.email}</dd></div>
            <div><dt>Membro desde</dt><dd>{formatDate(member?.created_at || user?.created_at)}</dd></div>
          </dl>
        </section>

        <section className="accountCard" aria-labelledby="session-title">
          <span className="accountIcon" aria-hidden="true">◉</span>
          <div><span className="accountLabel">Segurança</span><h2 id="session-title">Sessão atual</h2></div>
          <p className="sessionStatus"><i aria-hidden="true" /> Conectado</p>
          <p>Último acesso: {formatDate(user?.last_sign_in_at)}</p>
          <button className="signOutButton" type="button" onClick={signOut}>Sair da conta</button>
        </section>
      </div>

      <aside className="identityNotice">
        <strong>Como funciona a identidade?</strong>
        <p>O personagem escolhido permanece vinculado à sua conta e acompanha você em todos os chats. A troca é feita somente por esta página, e personagens usados por outras pessoas continuam indisponíveis.</p>
      </aside>
      {message && <p className="accountMessage" role="status">{message}</p>}
    </main>
  );
}
