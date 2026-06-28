"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "./Avatar";
import { getCharacter } from "@/lib/characters";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const items = [
  { href: "/", label: "Início", icon: "home" },
  { href: "/personagens", label: "Personagens", icon: "people" },
  { href: "/chats", label: "Chats", icon: "chat" },
  { href: "/conta", label: "Conta", icon: "user" }
];

function Icon({ name }) {
  const paths = {
    home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10M9.5 20v-6h5v6"/></>,
    people: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-4 2.5-6 6-6s6 2 6 6M15 15c3.5 0 6 1.5 6 5"/></>,
    chat: <path d="M4 5h16v11H9l-5 4V5Z"/>,
    mask: <><path d="M4 6c5-3 11-3 16 0v7c0 5-4 8-8 9-4-1-8-4-8-9V6Z"/><path d="M7 11c1.5-1 3-1 4 0M13 11c1-1 2.5-1 4 0M9 16c2 1.5 4 1.5 6 0"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.5 3-7 8-7s8 2.5 8 7"/></>
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

export default function AppNav() {
  const pathname = usePathname();
  const [identity, setIdentity] = useState(null);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase || pathname === "/admin") return;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return setIdentity(null);
      const { data: member } = await supabase.from("member_profiles").select("selected_character_slug").eq("user_id", data.user.id).maybeSingle();
      setIdentity(getCharacter(member?.selected_character_slug) || null);
    });
  }, [pathname, supabase]);

  if (pathname === "/admin") return null;
  return (
    <nav className="appNav" aria-label="Navegação principal">
      <Link className="appBrand" href="/" aria-label="Entre Maldições"><span>呪</span></Link>
      <div className="appNavItems">
        {items.map((item) => {
          const base = item.href.split("#")[0];
          const active = base === "/" ? pathname === "/" : pathname.startsWith(base);
          return <Link href={item.href} aria-current={active ? "page" : undefined} key={item.label}><Icon name={item.icon}/><span>{item.label}</span></Link>;
        })}
      </div>
      {identity && <Link className="navIdentity" href="/conta" title={`Identidade ativa: ${identity.name}`}><Avatar src={identity.avatar} name={identity.name} size={38}/><small>{identity.name.split(" ")[0]}</small></Link>}
    </nav>
  );
}
