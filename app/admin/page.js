"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const login = async (event) => {
    event.preventDefault();
    setMessage("Entrando...");
    const fields = new FormData(event.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({ email: fields.get("email"), password: fields.get("password") });
    setMessage(error ? error.message : "Login realizado.");
  };

  if (!supabase) return <main className="authPage"><h1>Supabase não configurado</h1><p>Confira as variáveis de ambiente.</p></main>;
  if (user) return <main className="authPage"><h1>Área de edição</h1><p>Conectado como {user.email}.</p><Link href="/">Escolher um personagem</Link><button onClick={() => supabase.auth.signOut()}>Sair</button></main>;
  return (
    <main className="authPage">
      <span className="eyebrow">Acesso protegido</span><h1>Entrar para editar</h1>
      <form onSubmit={login}><label>E-mail<input name="email" type="email" required /></label><label>Senha<input name="password" type="password" required /></label><button type="submit">Entrar</button></form>
      {message && <p role="status">{message}</p>}
      <Link href="/">Voltar ao site</Link>
    </main>
  );
}
