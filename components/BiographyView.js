"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function Block({ block, index }) {
  if (block.type === "image" && block.url) return <figure className="bioImage"><Image src={block.url} alt={block.alt || "Imagem da biografia"} width={900} height={600} unoptimized={block.url.startsWith("http")} /><figcaption>{block.caption}</figcaption></figure>;
  if (block.type === "divider") return <div className="bioDivider" aria-hidden="true">✦ ───────── ✦</div>;
  if (block.type === "heading") return <h2 className={`bioFont-${block.font || "serif"}`}>{block.content}</h2>;
  if (block.type === "facts") return <dl className="bioFacts">{(block.items || []).map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>;
  return <p className={`bioFont-${block.font || "sans"} bioAlign-${block.align || "left"}`} key={index}>{block.content}</p>;
}

export default function BiographyView({ character }) {
  const defaults = [
    { type: "heading", content: `Bem-vindo à ficha de ${character.name}`, font: "decorative" },
    { type: "divider" },
    { type: "text", content: character.bio, font: "serif", align: "center" },
    { type: "image", url: character.cover || character.avatar, alt: character.name, caption: character.summary },
    { type: "heading", content: "Sobre", font: "serif" },
    { type: "text", content: character.story, font: "sans", align: "left" }
  ];
  const [blocks, setBlocks] = useState(defaults);
  const [draft, setDraft] = useState(defaults);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const [status, setStatus] = useState("");
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) return;
    supabase.from("character_profiles").select("bio_blocks").eq("slug", character.slug).maybeSingle().then(({ data }) => {
      if (Array.isArray(data?.bio_blocks) && data.bio_blocks.length) { setBlocks(data.bio_blocks); setDraft(data.bio_blocks); }
    });
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user || null);
      if (!data.user) return;
      const { data: member } = await supabase.from("member_profiles").select("selected_character_slug").eq("user_id", data.user.id).maybeSingle();
      setCanEdit(member?.selected_character_slug === character.slug);
    });
  }, [character.slug, supabase]);

  const addBlock = (type) => {
    const block = type === "divider" ? { type: "divider" }
      : type === "heading" ? { type, content: "Novo título", font: "serif" }
      : { type: "text", content: "Novo texto", font: "sans", align: "left" };
    setDraft((current) => [...current, block]);
  };

  const updateBlock = (index, changes) => setDraft((current) => current.map((block, position) => position === index ? { ...block, ...changes } : block));
  const removeBlock = (index) => setDraft((current) => current.filter((_block, position) => position !== index));

  const addImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setStatus("Enviando imagem...");
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${character.slug}/${user.id}/bio-${Date.now()}.${extension}`;
    const { error } = await supabase.storage.from("profile-media").upload(path, file, { contentType: file.type });
    if (error) return setStatus(error.message);
    const url = supabase.storage.from("profile-media").getPublicUrl(path).data.publicUrl;
    setDraft((current) => [...current, { type: "image", url, alt: `Imagem da biografia de ${character.name}`, caption: "" }]);
    setStatus("Imagem adicionada.");
  };

  const save = async () => {
    setStatus("Salvando biografia...");
    const { error } = await supabase.from("character_profiles").upsert({
      slug: character.slug, name: character.name, handle: character.handle, bio: character.bio,
      tags: character.tags, avatar_url: character.avatar, cover_url: character.cover, stats: character.stats,
      bio_blocks: draft, updated_by: user.id, updated_at: new Date().toISOString()
    });
    if (error) return setStatus(error.message);
    setBlocks(draft); setEditing(false); setStatus("Biografia publicada.");
  };

  return <main className="biographyPage"><header><Link href={`/personagens/${character.slug}`} aria-label="Voltar ao perfil">‹</Link><span className="eyebrow">Biografia completa</span><h1>{character.name}</h1>{canEdit && <button className="bioEditToggle" onClick={() => setEditing((value) => !value)}>{editing ? "Fechar editor" : "Editar biografia"}</button>}</header>
    {editing && <section className="bioEditor"><div className="bioToolbar"><button onClick={() => addBlock("heading")}>＋ Título</button><button onClick={() => addBlock("text")}>＋ Texto</button><button onClick={() => addBlock("divider")}>＋ Divisor</button><label>＋ Imagem<input type="file" accept="image/png,image/jpeg,image/webp" onChange={addImage}/></label></div>
      <div className="bioBlockList">{draft.map((block, index) => <div className="bioBlockEditor" key={`edit-${index}`}><strong>{block.type}</strong>{block.content !== undefined && <textarea value={block.content} onChange={(event) => updateBlock(index, { content: event.target.value })}/>} {(block.type === "text" || block.type === "heading") && <select value={block.font || "sans"} onChange={(event) => updateBlock(index, { font: event.target.value })}><option value="sans">Fonte limpa</option><option value="serif">Fonte clássica</option><option value="mono">Fonte monoespaçada</option><option value="decorative">Fonte decorativa</option></select>}{block.type === "text" && <select value={block.align || "left"} onChange={(event) => updateBlock(index, { align: event.target.value })}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select>}{block.type === "image" && <input value={block.caption || ""} placeholder="Legenda" onChange={(event) => updateBlock(index, { caption: event.target.value })}/>}<button onClick={() => removeBlock(index)}>Remover</button></div>)}</div>
      <button className="saveBiography" onClick={save}>Salvar biografia</button></section>}
    {status && <p className="bioStatus" role="status">{status}</p>}
    <article>{blocks.map((block, index) => <Block block={block} index={index} key={`${block.type}-${index}`}/>)}</article></main>;
}
