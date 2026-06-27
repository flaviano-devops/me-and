import { notFound } from "next/navigation";
import CharacterProfile from "@/components/CharacterProfile";
import Sidebar from "@/components/Sidebar";
import { characters, getCharacter } from "@/lib/characters";

export function generateStaticParams() {
  return characters.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const character = getCharacter(slug);
  return character ? { title: character.name, description: character.summary } : {};
}

export default async function CharacterPage({ params }) {
  const { slug } = await params;
  const character = getCharacter(slug);
  if (!character) notFound();
  return (
    <div className="shell">
      <Sidebar current={slug} />
      <main className="main profileMain">
        <CharacterProfile character={character} />
        <article className="story"><span className="eyebrow">Sobre o personagem</span><h2>{character.name}</h2><p>{character.story}</p></article>
      </main>
    </div>
  );
}
