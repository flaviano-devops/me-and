"use client";

import { useEffect, useState } from "react";

const fileToDataUrl = (file) => new Promise((resolve) => {
  if (!file) return resolve(null);
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.readAsDataURL(file);
});

export default function ProfileEditor({ character, onChange }) {
  const storageKey = `profile-next-${character.slug}`;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(character);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (saved) {
        const merged = { ...character, ...saved };
        setForm(merged);
        onChange(merged);
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [character, onChange, storageKey]);

  const save = async (event) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const avatar = await fileToDataUrl(fields.get("avatar"));
    const cover = await fileToDataUrl(fields.get("cover"));
    const updated = {
      ...form,
      name: fields.get("name").trim() || character.name,
      handle: fields.get("handle").trim() || character.handle,
      bio: fields.get("bio").trim() || character.bio,
      tags: fields.get("tags").split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 5),
      avatar: avatar || form.avatar || character.avatar,
      cover: cover || form.cover || character.cover
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setForm(updated);
      onChange(updated);
      setOpen(false);
    } catch {
      window.alert("A imagem é grande demais. Escolha um arquivo menor.");
    }
  };

  const restoreImages = () => {
    const restored = { ...form, avatar: character.avatar, cover: character.cover };
    localStorage.setItem(storageKey, JSON.stringify(restored));
    setForm(restored);
    onChange(restored);
  };

  const restoreAll = () => {
    localStorage.removeItem(storageKey);
    setForm(character);
    onChange(character);
    setOpen(false);
  };

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
            <button type="button" onClick={restoreAll}>Restaurar tudo</button>
            <button type="button" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="primary" type="submit">Salvar</button>
          </div>
        </form>
      )}
    </>
  );
}
