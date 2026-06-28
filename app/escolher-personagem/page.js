import { Suspense } from "react";
import CharacterSelect from "@/components/CharacterSelect";

export const metadata = { title: "Escolher personagem" };
export default function ChooseCharacterPage() {
  return <Suspense fallback={<main className="selectPage"><p>Carregando personagens...</p></main>}><CharacterSelect /></Suspense>;
}
