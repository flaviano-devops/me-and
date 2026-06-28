"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const fromDatabase = (row, fallback) => ({
  ...fallback,
  name: row.name,
  handle: row.handle,
  bio: row.bio,
  tags: row.tags || fallback.tags,
  avatar: row.avatar_url || fallback.avatar,
  cover: row.cover_url || fallback.cover,
  stats: row.stats || fallback.stats
});

export default function ProfileEditor({ character, onChange }) {
  const supabase = getSupabaseBrowserClient();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const [form, setForm] = useState(character);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user || null);
      if (!data.user) return;
      const { data: membership } = await supabase.from("member_profiles").select("selected_character_slug").eq("user_id", data.user.id).maybeSingle();
      setCanEdit(membership?.selected_character_slug === character.slug);
    });
    supabase.from("character_profiles").select("*").eq("slug", character.slug).maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const profile = fromDatabase(data, character);
        setForm(profile);
        onChange(profile);
      });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => data.subscription.unsubscribe();
  }, [character, onChange, supabase]);

  const upload = async (file, type) => {
    if (!file) return null;
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${character.slug}/${user.id}/${type}-${Date.now()}.${extension}`;
    const { error } = await supabase.storage.from("profile-media").upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    return supabase.storage.from("profile-media").getPublicUrl(path).data.publicUrl;
  };

  const save = async (event) => {
    event.preventDefault();
    if (!supabase || !user) return;
    setMessage("Salvando...");
    try {
      const fields = new FormData(event.currentTarget);
      const avatar = await upload(fields.get("avatar")?.size ? fields.get("avatar") : null, "avatar");
      const cover = await upload(fields.get("cover")?.size ? fields.get("cover") : null, "cover");
      const updated = {
        ...form,
        name: fields.get("name").trim() || character.name,
        handle: fields.get("handle").trim() || character.handle,
        bio: fields.get("bio").trim() || character.bio,
        tags: fields.get("tags").split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 5),
        avatar: avatar || form.avatar || character.avatar,
        cover: cover || form.cover || character.cover
      };
      const { error } = await supabase.from("character_profiles").upsert({
        slug: character.slug,
        name: updated.name,
        handle: updated.handle,
        bio: updated.bio,
        tags: updated.tags,
        avatar_url: updated.avatar,
        cover_url: updated.cover,
        stats: updated.stats,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      setForm(updated);
      onChange(updated);
      setMessage("Perfil salvo no Supabase.");
      setOpen(false);
    } catch (error) {
      setMessage(error.message || "Não foi possível salvar.");
    }
  };

  const restoreImages = async () => {
    const restored = { ...form, avatar: character.avatar, cover: character.cover };
    setForm(restored);
    onChange(restored);
    setMessage("Imagens restauradas. Clique em Salvar para confirmar.");
  };

  if (!supabase) return <p className="editorNotice">Supabase não configurado.</p>;
  if (!user || !canEdit) return null;

  return (
    <>
      <button className="editButton" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg>
        Editar perfil
      </button>
      {open && (
        <form className="editor" onSubmit={save}>
          <h2>Editar perfil</h2>
          <div className="formGrid">
            <label>Nome<input name="name" maxLength="40" defaultValue={form.name} /></label>
            <label>Identificador<input name="handle" maxLength="50" defaultValue={form.handle} /></label>
            <label className="full">Etiquetas<input name="tags" maxLength="100" defaultValue={form.tags.join(", ")} /></label>
            <label className="full">Bio<textarea name="bio" maxLength="220" defaultValue={form.bio} /></label>
            <label>Nova capa<input name="cover" type="file" accept="image/png,image/jpeg,image/webp" /></label>
            <label>Novo avatar<input name="avatar" type="file" accept="image/png,image/jpeg,image/webp" /></label>
          </div>
          <div className="editorActions">
            <button type="button" onClick={restoreImages}>Imagens originais</button>
            <button type="button" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="primary" type="submit">Salvar no Supabase</button>
          </div>
        </form>
      )}
      {message && <p className="editorNotice" role="status">{message}</p>}
    </>
  );
}
