"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "./Avatar";
import { characters, getCharacter } from "@/lib/characters";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function HomeDashboard() {
  const [identity, setIdentity] = useState(null);
  const [roomCount, setRoomCount] = useState(null);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) return;
    Promise.all([
      supabase.auth.getUser(),
      supabase.from("chat_rooms").select("id", { count: "exact", head: true })
    ]).then(async ([auth, rooms]) => {
      setRoomCount(rooms.count ?? 0);
      if (!auth.data.user) return;
      const { data: member } = await supabase.from("member_profiles").select("selected_character_slug").eq("user_id", auth.data.user.id).maybeSingle();
      setIdentity(getCharacter(member?.selected_character_slug) || null);
    });
  }, [supabase]);

  return (
    <main className="homePage">
      <header className="homeHero">
        <div><span className="eyebrow">Comunidade Jujutsu Kaisen</span><h1>Entre maldições.<br/>Crie histórias.</h1><p>Assuma uma identidade, encontre outros personagens e participe de conversas em tempo real.</p></div>
        <div className="homeIdentity">
          <Avatar src={identity?.avatar} name={identity?.name || "Identidade"} size={88}/>
          <span><small>Sua identidade</small><strong>{identity?.name || "Não selecionada"}</strong><em>{identity?.summary || "Escolha um personagem para começar"}</em></span>
          <Link href="/conta">Gerenciar</Link>
        </div>
      </header>

      <section className="homeStats" aria-label="Visão geral da comunidade">
        <div><strong>{characters.length}</strong><span>Personagens</span></div>
        <div><strong>{roomCount ?? "—"}</strong><span>Chats públicos</span></div>
        <div><strong>Tempo real</strong><span>Conversas ativas</span></div>
      </section>

      <section className="homeSection" aria-labelledby="quick-title">
        <div className="sectionHeading"><span><small>Comece por aqui</small><h2 id="quick-title">O que você quer fazer?</h2></span></div>
        <div className="quickGrid">
          <Link href="/personagens"><span aria-hidden="true">◌</span><strong>Explorar personagens</strong><small>Pesquise perfis, histórias e veja quem está disponível.</small><b>Ver diretório →</b></Link>
          <Link href="/chats"><span aria-hidden="true">◇</span><strong>Entrar nos chats</strong><small>Converse usando automaticamente sua identidade ativa.</small><b>Abrir conversas →</b></Link>
          <Link href="/conta"><span aria-hidden="true">✦</span><strong>Minha conta</strong><small>Consulte seus dados e gerencie sua identidade.</small><b>Gerenciar conta →</b></Link>
        </div>
      </section>

      <section className="homeSection" aria-labelledby="featured-title">
        <div className="sectionHeading"><span><small>Conheça a comunidade</small><h2 id="featured-title">Personagens em destaque</h2></span><Link href="/personagens">Ver todos</Link></div>
        <div className="featuredCharacters">
          {characters.slice(0, 3).map((character) => <Link href={`/personagens/${character.slug}`} key={character.slug}><Avatar src={character.avatar} name={character.name} size={62}/><span><strong>{character.name}</strong><small>{character.summary}</small></span></Link>)}
        </div>
      </section>
    </main>
  );
}
