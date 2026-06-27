"use client";

import Image from "next/image";
import { useState } from "react";

export function EmptyAvatar({ size = 64 }) {
  return (
    <span className="emptyAvatar" style={{ width: size, height: size }} role="img" aria-label="Sem foto de perfil">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14Z" /></svg>
    </span>
  );
}

export default function Avatar({ src, name, size = 64, priority = false }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <EmptyAvatar size={size} />;
  return <Image className="avatarImage" src={src} alt={`Foto de perfil de ${name}`} width={size} height={size} priority={priority} onError={() => setFailed(true)} />;
}
