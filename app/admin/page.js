"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(mode === "login" ? "Verificando seus dados..." : "Criando sua conta...");
    const fields = new FormData(event.currentTarget);
    const credentials = { email: fields.get("email").trim(), password: fields.get("password") };
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword(credentials)
      : await supabase.auth.signUp({ ...credentials, options: { data: { display_name: fields.get("name")?.trim() || "Membro" } } });
    setLoading(false);
    if (result.error) return setMessage(result.error.message);
    if (mode === "register" && !result.data.session) return setMessage("Conta criada. Confira seu e-mail para confirmar o cadastro.");
    setMessage("Login realizado. Preparando seus personagens...");
    router.push("/escolher-personagem");
  };

  if (!supabase) return <main className="loginPage"><section className="loginCard"><h1>Configuração pendente</h1><p>As variáveis do Supabase não foram encontradas.</p></section></main>;
  if (user) return <main className="loginPage"><section className="loginCard"><span className="eyebrow">Sessão ativa</span><h1>Bem-vindo de volta</h1><p>{user.email}</p><div className="loginActions"><Link href="/escolher-personagem">Continuar</Link><button onClick={() => supabase.auth.signOut()}>Sair</button></div></section></main>;

  return (
    <main className="loginPage">
      <section className="loginVisual"><span className="loginSeal">呪</span><span className="eyebrow">MeAnd</span><h1>Escolha quem você quer ser.</h1><p>Entre na comunidade, assuma um personagem disponível e construa histórias com outras pessoas.</p></section>
      <section className="loginCard">
        <div className="loginTabs" role="tablist"><button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setMessage(""); }}>Entrar</button><button className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setMessage(""); }}>Criar conta</button></div>
        <h2>{mode === "login" ? "Acesse sua conta" : "Crie sua identidade"}</h2>
        <p>{mode === "login" ? "Use o e-mail e a senha definidos no cadastro." : "Depois do cadastro você escolherá um personagem disponível."}</p>
        <form onSubmit={submit}>
          {mode === "register" && <label>Nome de exibição<input name="name" type="text" minLength="2" maxLength="40" required /></label>}
          <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>
          <label>Senha<input name="password" type="password" minLength="6" autoComplete={mode === "login" ? "current-password" : "new-password"} required /></label>
          <button className="loginSubmit" type="submit" disabled={loading}>{loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}</button>
        </form>
        {message && <p className="authMessage" role="status">{message}</p>}
        <Link className="backLink" href="/">Voltar ao início</Link>
      </section>
    </main>
  );
}
