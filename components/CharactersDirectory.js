"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Avatar from "./Avatar";
import { characters } from "@/lib/characters";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function CharactersDirectory() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [occupied, setOccupied] = useState([]);
  const [mine, setMine] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) return setLoadingStatus(false);
    supabase.auth.getUser().then(async ({ data: auth }) => {
      const { data: members } = await supabase.from("member_profiles").select("user_id,selected_character_slug");
      setOccupied((members || []).map((member) => member.selected_character_slug));
      setMine((members || []).find((member) => member.user_id === auth.user?.id)?.selected_character_slug || null);
      setLoadingStatus(false);
    });
  }, [supabase]);

  const results = useMemo(() => {
    const term = normalize(query.trim());
    return characters.filter((character) => {
      const searchable = normalize([character.name, character.handle, character.summary, character.story, ...character.tags].join(" "));
      const matchesQuery = !term || searchable.includes(term);
      const isOccupied = occupied.includes(character.slug);
      const matchesFilter = filter === "all"
        || (filter === "available" && !isOccupied)
        || (filter === "occupied" && isOccupied)
        || (filter === "mine" && character.slug === mine);
      return matchesQuery && matchesFilter;
    });
  }, [filter, mine, occupied, query]);

  return (
    <main className="directoryPage">
      <header className="directoryHeader">
        <span className="eyebrow">Diretório da comunidade</span>
        <h1>Personagens</h1>
        <p>Explore cada identidade, conheça suas histórias e acompanhe a disponibilidade na comunidade.</p>
      </header>

      <section className="directoryTools" aria-label="Pesquisar e filtrar personagens">
        <label className="characterSearch"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg><span className="srOnly">Pesquisar personagens</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar por nome, técnica ou característica..."/></label>
        <div className="directoryFilters" role="group" aria-label="Filtrar disponibilidade">
          {[{ value: "all", label: "Todos" }, { value: "available", label: "Disponíveis" }, { value: "occupied", label: "Em uso" }, { value: "mine", label: "Minha identidade" }].map((option) => <button className={filter === option.value ? "active" : ""} type="button" onClick={() => setFilter(option.value)} aria-pressed={filter === option.value} key={option.value}>{option.label}</button>)}
        </div>
      </section>

      <div className="directoryResultSummary"><span><strong>{results.length}</strong> {results.length === 1 ? "personagem encontrado" : "personagens encontrados"}</span>{!loadingStatus && <small><i className="availableDot"/> Disponível <i className="occupiedDot"/> Em uso</small>}</div>

      <section className="directoryGrid" aria-live="polite">
        {results.map((character) => {
          const isMine = character.slug === mine;
          const isOccupied = occupied.includes(character.slug);
          return <article className="directoryCard" key={character.slug}>
            <div className="directoryCover" style={{ backgroundImage: `url("${character.cover || character.avatar}")` }}><span className={`availability ${isMine ? "mine" : isOccupied ? "occupied" : "available"}`}>{loadingStatus ? "Consultando..." : isMine ? "Sua identidade" : isOccupied ? "Em uso" : "Disponível"}</span></div>
            <div className="directoryCardBody">
              <Avatar src={character.avatar} name={character.name} size={82}/>
              <div className="directoryTitle"><h2>{character.name}</h2><span>{character.handle}</span></div>
              <p>{character.story}</p>
              <div className="directoryTags">{character.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              <div className="directoryActions"><Link href={`/personagens/${character.slug}`}>Ver perfil completo</Link><Link href={`/personagens/${character.slug}/bio`}>Biografia</Link></div>
            </div>
          </article>;
        })}
      </section>
      {results.length === 0 && <section className="emptyDirectory"><strong>Nenhum personagem encontrado</strong><p>Tente outro termo ou remova os filtros selecionados.</p><button type="button" onClick={() => { setQuery(""); setFilter("all"); }}>Limpar busca</button></section>}
    </main>
  );
}
