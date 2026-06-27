import Link from "next/link";
import Avatar from "./Avatar";
import { characters } from "@/lib/characters";

export default function Sidebar({ current }) {
  return (
    <aside className="sidebar" aria-label="Navegação entre personagens">
      <h2>Personagens</h2>
      <nav>
        <Link className="homeLink" href="/">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5M5.5 10v10h13V10M9.5 20v-6h5v6" /></svg>
          <span>Início</span>
        </Link>
        <ul>
          {characters.map((character) => (
            <li key={character.slug}>
              <Link href={`/personagens/${character.slug}`} aria-current={current === character.slug ? "page" : undefined}>
                <Avatar src={character.avatar} name={character.name} size={40} />
                <span>{character.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
