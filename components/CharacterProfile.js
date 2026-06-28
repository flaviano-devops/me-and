"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Avatar from "./Avatar";
import ProfileEditor from "./ProfileEditor";
import ProfileSocialActions from "./ProfileSocialActions";

export default function CharacterProfile({ character }) {
  const [profile, setProfile] = useState(character);
  const updateProfile = useCallback((value) => setProfile(value), []);
  const coverImages = [profile.cover, character.cover].filter((image, index, list) => image && list.indexOf(image) === index);
  const coverStyle = coverImages.length ? { backgroundImage: coverImages.map((image) => `url("${image}")`).join(",") } : undefined;

  return (
    <section className="profile" aria-label={`Perfil de ${profile.name}`}>
      <div className="cover" style={coverStyle}>
        <Avatar src={profile.avatar} name={profile.name} size={124} priority />
        <span className="online">Online</span>
        <h1>{profile.name}</h1>
        <p className="handle">{profile.handle}</p>
        <div className="tags">{profile.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <ProfileEditor character={character} onChange={updateProfile} />
      </div>
      <div className="stats" aria-label="Estatísticas do perfil">
        {profile.stats.map((stat, index) => (
          <div key={stat}><strong>{stat}</strong><span>{["Reputação", "Seguidores", "Visitantes"][index]}</span></div>
        ))}
      </div>
      {profile.gallery?.length > 0 && (
        <section className="profileGallery" aria-labelledby="profile-gallery-title">
          <h2 id="profile-gallery-title">Galeria</h2>
          <div>
            {profile.gallery.map((image, index) => (
              <Image
                src={image}
                alt={`${profile.name} — imagem ${index + 1} da galeria`}
                width={240}
                height={240}
                sizes="(max-width: 620px) 42vw, 180px"
                key={image}
              />
            ))}
          </div>
        </section>
      )}
      <Link className="bio" href={`/personagens/${character.slug}/bio`}><span><h2>Bio</h2><p>{profile.bio}</p></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></Link>
      <ProfileSocialActions characterSlug={character.slug} />
    </section>
  );
}
