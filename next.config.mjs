/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"]
  },
  async redirects() {
    return [
      { source: "/pages/pg1.html", destination: "/personagens/yuji", permanent: true },
      { source: "/pagesMegumi/pg1.html", destination: "/personagens/megumi", permanent: true },
      { source: "/pagesNobara/pg1.html", destination: "/personagens/nobara", permanent: true },
      { source: "/pages/gojo.html", destination: "/personagens/gojo", permanent: true },
      { source: "/pages/geto.html", destination: "/personagens/geto", permanent: true }
    ];
  }
};

export default nextConfig;
