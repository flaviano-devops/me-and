import "./globals.css";

export const metadata = {
  title: { default: "Entre Maldições", template: "%s — Entre Maldições" },
  description: "Perfis e histórias de personagens de Jujutsu Kaisen.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
