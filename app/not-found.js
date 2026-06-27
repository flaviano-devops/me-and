import Link from "next/link";

export default function NotFound() {
  return <main className="notFound"><strong>404</strong><h1>Página perdida nas sombras</h1><p>Este endereço não existe.</p><Link href="/">Voltar ao início</Link></main>;
}
