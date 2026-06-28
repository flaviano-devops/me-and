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
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) return;
    supabase.from("character_profiles").select("bio_blocks").eq("slug", character.slug).maybeSingle().then(({ data }) => {
      if (Array.isArray(data?.bio_blocks) && data.bio_blocks.length) setBlocks(data.bio_blocks);
    });
  }, [character.slug, supabase]);

  return <main className="biographyPage"><header><Link href={`/personagens/${character.slug}`} aria-label="Voltar ao perfil">‹</Link><span className="eyebrow">Biografia completa</span><h1>{character.name}</h1></header><article>{blocks.map((block, index) => <Block block={block} index={index} key={`${block.type}-${index}`}/>)}</article></main>;
}
