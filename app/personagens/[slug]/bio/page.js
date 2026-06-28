import { notFound } from "next/navigation";
import BiographyView from "@/components/BiographyView";
import { getCharacter } from "@/lib/characters";

export async function generateMetadata({ params }) { const { slug } = await params; const character = getCharacter(slug); return character ? { title: `Biografia de ${character.name}` } : {}; }
export default async function BiographyPage({ params }) { const { slug } = await params; const character = getCharacter(slug); if (!character) notFound(); return <BiographyView character={character}/>; }
