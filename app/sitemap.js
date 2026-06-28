import { characters } from "@/lib/characters";

export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return [{ url: base, lastModified: new Date() }, { url: `${base}/personagens`, lastModified: new Date() }, ...characters.map(({ slug }) => ({ url: `${base}/personagens/${slug}`, lastModified: new Date() }))];
}
