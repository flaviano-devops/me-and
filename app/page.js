import Link from "next/link";
import Avatar from "@/components/Avatar";
import { characters } from "@/lib/characters";

export default function HomePage() {
  return (
    <div className="shell noSidebar">
      <main className="main">
        <header className="intro">
          <span className="eyebrow">Jujutsu Kaisen</span>
          <h1>Entre maldições</h1>
          <p>Escolha um personagem para conhecer seu perfil, sua história e o que o torna inesquecível.</p>
        </header>
        <section className="characterGrid" id="personagens" aria-label="Perfis dos personagens">
          {characters.map((character) => (
            <Link className="characterCard" href={`/personagens/${character.slug}`} key={character.slug}>
              <Avatar src={character.avatar} name={character.name} size={74} />
              <span><strong>{character.name}</strong><small>{character.summary}</small></span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
